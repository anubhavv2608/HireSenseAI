import { BellRing, Trophy, UserCheck, UserPlus, Swords } from "lucide-react";
import type { NotificationType } from "../types/notifications.types";

export const NOTIFICATION_ICONS: Record<NotificationType, typeof UserPlus> = {
  friend_request: UserPlus,
  friend_accepted: UserCheck,
  challenge_received: Swords,
  challenge_accepted: Swords,
  challenge_declined: Swords,
  challenge_completed: Trophy,
  system: BellRing,
};
