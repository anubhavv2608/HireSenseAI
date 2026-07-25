import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/analysis/SectionCard";
import type { ExtractedJobText } from "../types/jobInput.types";

interface JobPreviewProps {
  extractedText: string;
  metadata: ExtractedJobText["metadata"];
  onUseText: () => void;
  onDiscard: () => void;
}

export function JobPreview({ extractedText, metadata, onUseText, onDiscard }: JobPreviewProps) {
  return (
    <SectionCard
      title="Extracted Text Preview"
      description={`${metadata.originalFileName} · ${metadata.wordCount} words · ${metadata.characterCount} characters`}
    >
      <div className="space-y-3">
        <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
          <p className="whitespace-pre-wrap text-sm text-foreground">{extractedText}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={onUseText}>
            Use this text
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDiscard}>
            Discard
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
