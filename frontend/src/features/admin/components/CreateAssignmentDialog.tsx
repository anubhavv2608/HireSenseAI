import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useCreateAssignment } from "../hooks/useCreateAssignment";
import type { Difficulty } from "../types/admin.types";

const DIFFICULTY_OPTIONS: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  title: "",
  leetcodeProblemId: "",
  leetcodeUrl: "",
  difficulty: "EASY" as Difficulty,
  topic: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
};

export function CreateAssignmentDialog({ open, onOpenChange }: CreateAssignmentDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const createMutation = useCreateAssignment();

  function handleConfirm() {
    createMutation.mutate(form, {
      onSuccess: () => {
        toastSuccess("Assignment created");
        setForm(emptyForm);
        onOpenChange(false);
      },
      onError: (error) => {
        const description = isApiError(error)
          ? (error.fieldErrors?.map((fieldError) => fieldError.message).join(" ") ?? error.message)
          : undefined;
        toastError("Couldn't create assignment", description);
      },
    });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Daily DSA assignment"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>LeetCode Problem ID</Label>
          <Input
            value={form.leetcodeProblemId}
            onChange={(event) => setForm({ ...form, leetcodeProblemId: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>LeetCode URL</Label>
          <Input
            value={form.leetcodeUrl}
            onChange={(event) => setForm({ ...form, leetcodeUrl: event.target.value })}
            placeholder="https://leetcode.com/problems/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                variant={form.difficulty === option ? "default" : "outline"}
                size="sm"
                onClick={() => setForm({ ...form, difficulty: option })}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <Input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Description (optional)</Label>
          <Textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        </div>
      </div>
    </Modal>
  );
}
