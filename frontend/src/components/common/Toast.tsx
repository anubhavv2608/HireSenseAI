import { toast } from "sonner";

export { toast };

export function toastSuccess(message: string, description?: string): void {
  toast.success(message, { description });
}

export function toastError(message: string, description?: string): void {
  toast.error(message, { description });
}
