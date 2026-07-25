import { connectDB, disconnectDB } from '../shared/config/database';
import { logger } from '../shared/config/logger';
import { UserModel } from '../modules/auth/auth.schema';
import { ProfileModel } from '../modules/profile/profile.schema';
import { ProfileRepository } from '../modules/profile/profile.repository';
import { humanizeUsername } from '../shared/utils/username';

/**
 * One-off backfill creating a minimal Profile document for every existing
 * User that predates auto-creating one at registration (see auth.service.ts).
 * Without a Profile, a user is invisible in Student Search regardless of how
 * many User accounts exist. Idempotent: only processes users with no
 * non-deleted Profile document.
 */
async function backfillMissingProfiles(): Promise<void> {
  await connectDB();

  try {
    const profileRepository = new ProfileRepository();
    const existingProfileUserIds = new Set(
      (await ProfileModel.find({ isDeleted: false }).select('userId')).map((p) => p.userId.toString())
    );

    const users = await UserModel.find({});
    const missing = users.filter((user) => !existingProfileUserIds.has(user._id.toString()));

    for (const user of missing) {
      await profileRepository.createProfile(user._id.toString(), {
        fullName: humanizeUsername(user.username),
        profileCompleted: false,
      });
    }

    logger.info(`[BackfillMissingProfiles] Checked ${users.length} users, created ${missing.length} profiles`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(`[BackfillMissingProfiles] Failed - ${error instanceof Error ? error.message : String(error)}`);
    await disconnectDB();
    process.exit(1);
  }
}

backfillMissingProfiles();
