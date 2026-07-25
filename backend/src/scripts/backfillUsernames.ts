import { connectDB, disconnectDB } from '../shared/config/database';
import { logger } from '../shared/config/logger';
import { UserModel } from '../modules/auth/auth.schema';
import { AuthRepository } from '../modules/auth/auth.repository';
import { ProfileModel } from '../modules/profile/profile.schema';
import { generateUniqueUsername, slugifyToUsernameBase } from '../shared/utils/username';

/**
 * One-off backfill assigning a unique `username` to every existing User
 * document that predates the username system. Idempotent: only processes
 * users where `username` doesn't already exist (sparse field).
 */
async function backfillUsernames(): Promise<void> {
  await connectDB();

  try {
    const repository = new AuthRepository();
    const users = await UserModel.find({ username: { $exists: false } });

    let updated = 0;
    for (const user of users) {
      const profile = await ProfileModel.findOne({ userId: user._id, isDeleted: false });
      const seed = profile?.fullName || user.email.split('@')[0] || user.email;
      const base = slugifyToUsernameBase(seed);
      const username = await generateUniqueUsername(base, (candidate) => repository.isUsernameTaken(candidate));

      await UserModel.updateOne({ _id: user._id }, { $set: { username } });
      updated += 1;
    }

    logger.info(`[BackfillUsernames] Matched ${users.length}, updated ${updated}`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(`[BackfillUsernames] Failed - ${error instanceof Error ? error.message : String(error)}`);
    await disconnectDB();
    process.exit(1);
  }
}

backfillUsernames();
