import { useState } from "react";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CreateChallengeModal } from "./CreateChallengeModal";

interface ChallengeActionButtonProps {
  targetUserId: string;
  targetName: string;
  size?: "sm" | "default";
}

export function ChallengeActionButton({ targetUserId, targetName, size = "sm" }: ChallengeActionButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || user._id === targetUserId) {
    return null;
  }

  return (
    <>
      <Button
        size={size}
        variant="outline"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <Swords className="size-4" /> Challenge
      </Button>
      <CreateChallengeModal open={open} onOpenChange={setOpen} opponentUserId={targetUserId} opponentName={targetName} />
    </>
  );
}
