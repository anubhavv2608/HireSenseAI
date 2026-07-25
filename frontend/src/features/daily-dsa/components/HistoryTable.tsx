import { StatusBadge } from "@/components/common/StatusBadge";
import { DifficultyBadge } from "./DifficultyBadge";
import { formatAssignmentDate as formatDate } from "../utils/formatDate";
import type { HistoryItem } from "../types/dailyDsa.types";

function HistoryRow({ item, layout }: { item: HistoryItem; layout: "row" | "card" }) {
  if (layout === "card") {
    return (
      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground">{item.assignment.title}</p>
          <DifficultyBadge difficulty={item.assignment.difficulty} />
        </div>
        <p className="text-sm text-muted-foreground">{formatDate(item.assignment.date)}</p>
        <StatusBadge tone={item.completed ? "success" : "neutral"}>
          {item.completed ? "Completed" : "Not completed"}
        </StatusBadge>
      </div>
    );
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4 text-sm text-muted-foreground">{formatDate(item.assignment.date)}</td>
      <td className="py-3 pr-4 font-medium text-foreground">{item.assignment.title}</td>
      <td className="py-3 pr-4">
        <DifficultyBadge difficulty={item.assignment.difficulty} />
      </td>
      <td className="py-3 pr-4">
        <StatusBadge tone={item.completed ? "success" : "neutral"}>
          {item.completed ? "Completed" : "Not completed"}
        </StatusBadge>
      </td>
    </tr>
  );
}

export function HistoryTable({ items }: { items: HistoryItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 pr-4 font-medium">Questions</th>
            <th className="pb-2 pr-4 font-medium">Difficulty</th>
            <th className="pb-2 pr-4 font-medium">Completed</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <HistoryRow key={item.assignment._id} item={item} layout="row" />
          ))}
        </tbody>
      </table>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <HistoryRow key={item.assignment._id} item={item} layout="card" />
        ))}
      </div>
    </div>
  );
}
