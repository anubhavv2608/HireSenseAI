import { Request, Response } from 'express';
import { config } from '../../shared/config';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { UnauthorizedError } from '../../shared/errors/ApiError';
import { AuthService } from './auth.service';
import { AUTH_CONSTANTS, AUTH_MESSAGES } from './auth.constants';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: config.env === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: config.env === 'production' ? 'none' : 'lax',
    });
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await this.authService.register(req.body);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(201).json(
      ApiResponse.success(AUTH_MESSAGES.REGISTER_SUCCESS, {
        user,
        accessToken: tokens.accessToken,
      })
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await this.authService.login(req.body);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json(
      ApiResponse.success(AUTH_MESSAGES.LOGIN_SUCCESS, {
        user,
        accessToken: tokens.accessToken,
      })
    );
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json(
      ApiResponse.success(AUTH_MESSAGES.REFRESH_SUCCESS, {
        accessToken: tokens.accessToken,
      })
    );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.userId) {
      await this.authService.logout(req.user.userId);
    }
    this.clearRefreshTokenCookie(res);

    res.status(200).json(ApiResponse.success(AUTH_MESSAGES.LOGOUT_SUCCESS));
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.forgotPassword(req.body.email);

    res.status(200).json(ApiResponse.success(AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS));
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    await this.authService.resetPassword(token, newPassword);

    res.status(200).json(ApiResponse.success(AUTH_MESSAGES.RESET_PASSWORD_SUCCESS));
  });

  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await this.authService.googleLogin(req.body.idToken, req.body.mode);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json(
      ApiResponse.success(AUTH_MESSAGES.LOGIN_SUCCESS, {
        user,
        accessToken: tokens.accessToken,
      })
    );
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.getCurrentUser(req.user!.userId);

    res.status(200).json(ApiResponse.success('User retrieved successfully', { user }));
  });

  checkUsernameAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.query as { username: string };
    const result = await this.authService.checkUsernameAvailability(username);

    res.status(200).json(ApiResponse.success(AUTH_MESSAGES.USERNAME_AVAILABILITY_CHECKED, result));
  });

  updateUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.body as { username: string };
    const user = await this.authService.updateUsername(req.user!.userId, username);

    res.status(200).json(ApiResponse.success(AUTH_MESSAGES.USERNAME_UPDATED, { user }));
  });
}
