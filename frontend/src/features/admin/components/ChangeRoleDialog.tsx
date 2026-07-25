import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useChangeUserRole } from "../hooks/useChangeUserRole";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import type { AdminUserRow } from "../types/admin.types";
import type { Role } from "@/features/auth/types/auth.types";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserRow;
}

export function ChangeRoleDialog({ open, onOpenChange, user }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const changeRoleMutation = useChangeUserRole();

  function handleConfirm() {
    changeRoleMutation.mutate(
      { id: user.userId, role: selectedRole },
      {
        onSuccess: () => {
          toastSuccess("Role updated");
          onOpenChange(false);
        },
        onError: (error) => {
          toastError("Couldn't update role", isApiError(error) ? error.message : undefined);
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Change role for ${user.email}`}
      description="Select the new role for this user."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={changeRoleMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={changeRoleMutation.isPending || selectedRole === user.role}
          >
            {changeRoleMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label>Role</Label>
        <div className="flex flex-col gap-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedRole(option.value)}
              className={cn(
                "flex items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted",
                selectedRole === option.value && "border-primary bg-accent text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
