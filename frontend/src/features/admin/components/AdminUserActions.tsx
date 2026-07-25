import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAuth } from "@/hooks/useAuth";
import { useSetUserActive } from "../hooks/useSetUserActive";
import { useDeleteAdminUser } from "../hooks/useDeleteAdminUser";
import { ChangeRoleDialog } from "./ChangeRoleDialog";
import type { AdminUserRow } from "../types/admin.types";

interface AdminUserActionsProps {
  user: AdminUserRow;
}

export function AdminUserActions({ user }: AdminUserActionsProps) {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);

  const setActiveMutation = useSetUserActive();
  const deleteMutation = useDeleteAdminUser();

  const isTargetSelf = currentUser?._id === user.userId;
  const isTargetSuperAdmin = user.role === "super_admin";

  const canToggleActive = !isTargetSuperAdmin;
  const canChangeRole = isSuperAdmin && !isTargetSelf;
  const canDelete = isSuperAdmin && !isTargetSelf;

  if (!canToggleActive && !canChangeRole && !canDelete) {
    return null;
  }

  function handleToggleActive() {
    setActiveMutation.mutate(
      { id: user.userId, isActive: !user.isActive },
      {
        onSuccess: () => toastSuccess(user.isActive ? "User disabled" : "User enabled"),
        onError: (error) => toastError("Couldn't update user", isApiError(error) ? error.message : undefined),
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(user.userId, {
      onSuccess: () => {
        toastSuccess("User deleted");
        setConfirmDeleteOpen(false);
      },
      onError: (error) => {
        toastError("Couldn't delete user", isApiError(error) ? error.message : undefined);
      },
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.email}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canToggleActive && (
            <DropdownMenuItem onSelect={handleToggleActive} disabled={setActiveMutation.isPending}>
              {user.isActive ? "Disable" : "Enable"}
            </DropdownMenuItem>
          )}
          {canChangeRole && <DropdownMenuItem onSelect={() => setChangeRoleOpen(true)}>Change Role…</DropdownMenuItem>}
          {canDelete && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                setConfirmDeleteOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canChangeRole && <ChangeRoleDialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen} user={user} />}

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete user?"
        description={`This will deactivate "${user.email}"'s account. This does not permanently erase their data.`}
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
