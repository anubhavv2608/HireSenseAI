import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function SectionDivider({ className }: { className?: string }) {
  return <Separator className={cn("my-6", className)} />;
}
