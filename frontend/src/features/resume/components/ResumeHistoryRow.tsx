import { StatusBadge } from "@/components/common/StatusBadge";
import { ResumeStatusBadge } from "./ResumeStatusBadge";
import { ResumeActions } from "./ResumeActions";
import type { Resume } from "../types/resume.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

interface ResumeHistoryRowProps {
  resume: Resume;
  layout: "row" | "card";
}

export function ResumeHistoryRow({ resume, layout }: ResumeHistoryRowProps) {
  if (layout === "card") {
    return (
      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium break-all text-foreground">{resume.originalFilename}</p>
          <ResumeActions resume={resume} />
        </div>
        <p className="text-sm text-muted-foreground">{formatDate(resume.uploadedAt)}</p>
        <div className="flex items-center gap-2">
          <ResumeStatusBadge status={resume.status} />
          {resume.isActive && <StatusBadge tone="success">Active</StatusBadge>}
        </div>
      </div>
    );
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4 font-medium break-all text-foreground">{resume.originalFilename}</td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">{formatDate(resume.uploadedAt)}</td>
      <td className="py-3 pr-4">
        <ResumeStatusBadge status={resume.status} />
      </td>
      <td className="py-3 pr-4">{resume.isActive && <StatusBadge tone="success">Active</StatusBadge>}</td>
      <td className="py-3 text-right">
        <ResumeActions resume={resume} />
      </td>
    </tr>
  );
}
