import { Schema, model, Document, Types } from 'mongoose';
import { CHALLENGE_STATUSES, CHALLENGE_DIFFICULTIES } from './challenges.constants';
import { ChallengeDifficulty, ChallengeStatus } from './challenges.types';

export interface IChallengeProblem {
  title: string;
  url?: string;
  difficulty?: ChallengeDifficulty;
  notes?: string;
}

export interface IChallengeDocument extends Document {
  challengerId: Types.ObjectId;
  opponentId: Types.ObjectId;
  problem: IChallengeProblem;
  status: ChallengeStatus;
  challengerCompletedAt?: Date | null;
  opponentCompletedAt?: Date | null;
  winnerId?: Types.ObjectId | null;
  respondedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallengeDocument>(
  {
    challengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    opponentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: {
      title: { type: String, required: true, trim: true },
      url: { type: String, trim: true },
      difficulty: { type: String, enum: CHALLENGE_DIFFICULTIES },
      notes: { type: String, trim: true },
    },
    status: { type: String, enum: CHALLENGE_STATUSES, default: 'pending', index: true },
    challengerCompletedAt: { type: Date, default: null },
    opponentCompletedAt: { type: Date, default: null },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

challengeSchema.index({ opponentId: 1, status: 1, createdAt: -1 });
challengeSchema.index({ challengerId: 1, status: 1, createdAt: -1 });

export const ChallengeModel = model<IChallengeDocument>('Challenge', challengeSchema);
