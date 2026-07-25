import { FileText } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export function EmptyResumeState({ description = "Upload a PDF to get started." }: { description?: string }) {
  return <EmptyState icon={FileText} title="No resume yet" description={description} />;
}
