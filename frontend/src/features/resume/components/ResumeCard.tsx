import { ExternalLink, FileText } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { Button } from "@/components/ui/button";
import { ResumeStatusBadge } from "./ResumeStatusBadge";
import type { Resume } from "../types/resume.types";

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

interface ResumeCardProps {
  resume: Resume;
  title?: string;
}

export function ResumeCard({ resume, title = "Current Resume" }: ResumeCardProps) {
  return (
    <ContentCard title={title}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1.5">
            <p className="font-medium break-all text-foreground">{resume.originalFilename}</p>
            <p className="text-sm text-muted-foreground">
              Version {resume.version} &middot; Uploaded {formatDate(resume.uploadedAt)} &middot;{" "}
              {formatFileSize(resume.fileSize)}
            </p>
            <ResumeStatusBadge status={resume.status} />
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
          <a href={resume.storageUrl} target="_blank" rel="noreferrer">
            View <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </ContentCard>
  );
}
