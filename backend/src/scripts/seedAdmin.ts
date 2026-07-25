import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../shared/config/database';
import { logger } from '../shared/config/logger';
import { AUTH_CONSTANTS } from '../modules/auth/auth.constants';
import { AuthRepository } from '../modules/auth/auth.repository';
import { UserModel } from '../modules/auth/auth.schema';
import { ROLES } from '../shared/constants/roles';
import { generateUniqueUsername, slugifyToUsernameBase } from '../shared/utils/username';

/**
 * One-time local script to bootstrap the first super_admin account. No HTTP
 * endpoint exposes role escalation by design. Run via `npm run seed:admin`
 * with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD set in the environment.
 *
 * Note: connectDB() retries on failure via setTimeout rather than rejecting,
 * so against an unreachable DB this script may hang rather than fail fast —
 * confirm MONGO_URI connectivity first.
 */
async function seedAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must both be set in the environment.');
    process.exit(1);
  }

  await connectDB();

  try {
    const repository = new AuthRepository();
    const existing = await repository.findByEmail(email);

    if (existing) {
      await repository.updateRole(existing._id.toString(), ROLES.SUPER_ADMIN);
      logger.info(`[SeedAdmin] Promoted existing user to super_admin [Email: ${email}]`);
    } else {
      const passwordHash = await bcrypt.hash(password, AUTH_CONSTANTS.SALT_ROUNDS);
      const username = await generateUniqueUsername(slugifyToUsernameBase(email.split('@')[0] ?? email), (candidate) =>
        repository.isUsernameTaken(candidate)
      );
      await UserModel.create({
        email: email.toLowerCase(),
        username,
        passwordHash,
        authProvider: 'email',
        role: ROLES.SUPER_ADMIN,
      });
      logger.info(`[SeedAdmin] Created new super_admin user [Email: ${email}]`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(`[SeedAdmin] Failed - ${error instanceof Error ? error.message : String(error)}`);
    await disconnectDB();
    process.exit(1);
  }
}

seedAdmin();
