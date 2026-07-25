import { ResumeHistoryRow } from "./ResumeHistoryRow";
import type { Resume } from "../types/resume.types";

export function ResumeHistoryTable({ resumes }: { resumes: Resume[] }) {
  return (
    <>
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">File name</th>
            <th className="pb-2 pr-4 font-medium">Upload date</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Active</th>
            <th className="sr-only pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((resume) => (
            <ResumeHistoryRow key={resume._id} resume={resume} layout="row" />
          ))}
        </tbody>
      </table>
      <div className="space-y-3 md:hidden">
        {resumes.map((resume) => (
          <ResumeHistoryRow key={resume._id} resume={resume} layout="card" />
        ))}
      </div>
    </>
  );
}
