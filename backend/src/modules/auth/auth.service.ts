import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../../shared/config';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../shared/errors/ApiError';
import { EmailService, welcomeEmail, passwordResetEmail } from '../../shared/email';
import { generateUniqueUsername, isValidUsername, slugifyToUsernameBase } from '../../shared/utils/username';
import { AuthRepository } from './auth.repository';
import { AUTH_CONSTANTS, AUTH_MESSAGES } from './auth.constants';
import { AuthTokens, TokenPayload, RegisterDTO, LoginDTO, GoogleAuthMode } from './auth.types';
import { IUserDocument } from './auth.schema';

export class TokenService {
  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret, { algorithms: ['HS256'] }) as TokenPayload;
  }
}

export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(config.google.clientId);
  }

  async verifyIdToken(idToken: string): Promise<{ email: string }> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new BadRequestError('Invalid Google token payload');
      }

      return { email: payload.email };
    } catch {
      throw new BadRequestError('Failed to verify Google ID token');
    }
  }
}

export class AuthService {
  private repository: AuthRepository;
  private tokenService: TokenService;
  private googleOAuthService: GoogleOAuthService;
  private emailService: EmailService;

  constructor() {
    this.repository = new AuthRepository();
    this.tokenService = new TokenService();
    this.googleOAuthService = new GoogleOAuthService();
    this.emailService = new EmailService();
  }

  private async generateUsernameFor(email: string): Promise<string> {
    const base = slugifyToUsernameBase(email.split('@')[0] ?? email);
    return generateUniqueUsername(base, (candidate) => this.repository.isUsernameTaken(candidate));
  }

  async register(dto: RegisterDTO): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    if (!dto.password) {
      throw new BadRequestError('Password is required for email registration');
    }

    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(dto.password, AUTH_CONSTANTS.SALT_ROUNDS);
    const username = await this.generateUsernameFor(dto.email);
    const user = await this.repository.createUser({
      email: dto.email,
      username,
      passwordHash,
      authProvider: 'email',
    });

    const tokens = this.tokenService.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.repository.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    await this.repository.updateLastLogin(user._id.toString());

    const { subject, html } = welcomeEmail(user.username);
    this.emailService.sendInBackground({ to: user.email, subject, html });

    return { user, tokens };
  }

  async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
    if (!isValidUsername(username)) {
      return { available: false };
    }
    const taken = await this.repository.isUsernameTaken(username);
    return { available: !taken };
  }

  async updateUsername(userId: string, username: string): Promise<IUserDocument> {
    const normalized = username.toLowerCase();
    if (!isValidUsername(normalized)) {
      throw new BadRequestError(AUTH_MESSAGES.INVALID_USERNAME);
    }

    const taken = await this.repository.isUsernameTaken(normalized, userId);
    if (taken) {
      throw new ConflictError(AUTH_MESSAGES.USERNAME_TAKEN);
    }

    const updated = await this.repository.updateUsername(userId, normalized);
    if (!updated) {
      throw new NotFoundError(AUTH_MESSAGES.USER_NOT_FOUND);
    }
    return updated;
  }

  async login(dto: LoginDTO): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    if (!dto.password) {
      throw new BadRequestError('Password is required for login');
    }

    const user = await this.repository.findByEmailWithPassword(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ForbiddenError('This account has been disabled.');
    }

    const tokens = this.tokenService.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.repository.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    await this.repository.updateLastLogin(user._id.toString());

    return { user, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const user = await this.repository.findByIdWithRefreshToken(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    if (!user.isActive) {
      throw new ForbiddenError('This account has been disabled.');
    }

    const tokens = this.tokenService.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.repository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.repository.updateRefreshToken(userId, null);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      // Prevent user enumeration: respond identically whether or not the account exists
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(
      Date.now() + AUTH_CONSTANTS.RESET_TOKEN_EXPIRATION_HOURS * 3600 * 1000
    );

    await this.repository.updateResetPasswordToken(
      user._id.toString(),
      resetPasswordToken,
      resetPasswordExpires
    );

    const resetUrl = `${config.cors.origin}/reset-password?token=${resetToken}`;
    const { subject, html } = passwordResetEmail(resetUrl);
    this.emailService.sendInBackground({ to: user.email, subject, html });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.repository.findByResetPasswordToken(hashedToken);

    if (!user) {
      throw new BadRequestError(AUTH_MESSAGES.INVALID_RESET_TOKEN);
    }

    const passwordHash = await bcrypt.hash(newPassword, AUTH_CONSTANTS.SALT_ROUNDS);
    await this.repository.updatePassword(user._id.toString(), passwordHash);
  }

  async googleLogin(
    idToken: string,
    mode: GoogleAuthMode
  ): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    const { email } = await this.googleOAuthService.verifyIdToken(idToken);

    let user = await this.repository.findByEmail(email);

    if (mode === 'signup') {
      if (user) {
        throw new ConflictError(AUTH_MESSAGES.GOOGLE_ACCOUNT_ALREADY_EXISTS);
      }

      const username = await this.generateUsernameFor(email);
      user = await this.repository.createUser({
        email,
        username,
        authProvider: 'google',
      });

      const { subject, html } = welcomeEmail(user.username);
      this.emailService.sendInBackground({ to: user.email, subject, html });
    } else if (!user) {
      throw new NotFoundError(AUTH_MESSAGES.GOOGLE_ACCOUNT_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new ForbiddenError('This account has been disabled.');
    }

    const tokens = this.tokenService.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.repository.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    await this.repository.updateLastLogin(user._id.toString());

    return { user, tokens };
  }

  async getCurrentUser(userId: string): Promise<IUserDocument> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError(AUTH_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }
}
