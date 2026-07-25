import { connectDB, disconnectDB } from '../shared/config/database';
import { logger } from '../shared/config/logger';
import { ProfileModel } from '../modules/profile/profile.schema';

/**
 * One-off migration renaming legacy social URL fields on existing Profile
 * documents (githubUrl -> github, linkedinUrl -> linkedin, leetcodeUrl ->
 * leetcode, codeforcesUrl -> codeforces) to match the Community Foundation
 * field names. Uses the raw collection (not the Mongoose model) since the
 * schema no longer declares the old field names. Idempotent: $rename is a
 * no-op on documents that no longer have the old field.
 */
async function migrateProfileUrlFields(): Promise<void> {
  await connectDB();

  try {
    const result = await ProfileModel.collection.updateMany(
      {
        $or: [
          { githubUrl: { $exists: true } },
          { linkedinUrl: { $exists: true } },
          { leetcodeUrl: { $exists: true } },
          { codeforcesUrl: { $exists: true } },
        ],
      },
      {
        $rename: {
          githubUrl: 'github',
          linkedinUrl: 'linkedin',
          leetcodeUrl: 'leetcode',
          codeforcesUrl: 'codeforces',
        },
      }
    );

    logger.info(`[MigrateProfileUrlFields] Matched ${result.matchedCount}, modified ${result.modifiedCount}`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(
      `[MigrateProfileUrlFields] Failed - ${error instanceof Error ? error.message : String(error)}`
    );
    await disconnectDB();
    process.exit(1);
  }
}

migrateProfileUrlFields();
