import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useCreateChallenge } from "../hooks/useChallengeActions";
import type { ChallengeDifficulty } from "../types/challenges.types";

const DIFFICULTY_OPTIONS: ChallengeDifficulty[] = ["EASY", "MEDIUM", "HARD"];

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opponentUserId: string;
  opponentName: string;
}

export function CreateChallengeModal({ open, onOpenChange, opponentUserId, opponentName }: CreateChallengeModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const createMutation = useCreateChallenge();

  function reset() {
    setTitle("");
    setUrl("");
    setDifficulty(undefined);
    setNotes("");
  }

  function handleSubmit() {
    if (!title.trim()) {
      toastError("A problem title is required");
      return;
    }

    createMutation.mutate(
      {
        opponentUserId,
        problem: {
          title: title.trim(),
          url: url.trim() || undefined,
          difficulty,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toastSuccess(`Challenge sent to ${opponentName}`);
          reset();
          onOpenChange(false);
        },
        onError: (error) => toastError("Couldn't send challenge", isApiError(error) ? error.message : undefined),
      },
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Challenge ${opponentName}`}
      description="Pick a problem and send it their way."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Sending..." : "Send Challenge"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="challenge-title">Problem Title</Label>
          <Input
            id="challenge-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Two Sum"
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="challenge-url">Link (optional)</Label>
          <Input
            id="challenge-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="leetcode.com/problems/two-sum"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Difficulty (optional)</Label>
          <Select
            value={difficulty}
            onValueChange={(value) => setDifficulty(value as ChallengeDifficulty)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="challenge-notes">Notes (optional)</Label>
          <Textarea
            id="challenge-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any extra context for your opponent"
            maxLength={1000}
          />
        </div>
      </div>
    </Modal>
  );
}
