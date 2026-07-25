import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { useSearchStudents } from "../hooks/useSearchStudents";
import { SearchFilters } from "../components/SearchFilters";
import { StudentCard } from "../components/StudentCard";
import type { SearchStudentsQuery } from "../types/profile.types";

const PAGE_SIZE = 12;
const DEFAULT_SORT: SearchStudentsQuery["sort"] = "newest";
const SORT_VALUES: SearchStudentsQuery["sort"][] = ["newest", "oldest", "name"];

function parseSkills(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function parseSort(value: string | null): SearchStudentsQuery["sort"] {
  return SORT_VALUES.includes(value as SearchStudentsQuery["sort"]) ? (value as SearchStudentsQuery["sort"]) : DEFAULT_SORT;
}

export default function StudentSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [college, setCollege] = useState(() => searchParams.get("college") ?? "");
  const [branch, setBranch] = useState(() => searchParams.get("branch") ?? "");
  const [graduationYear, setGraduationYear] = useState(() => searchParams.get("year") ?? "");
  const [skills, setSkills] = useState<string[]>(() => parseSkills(searchParams.get("skills")));
  const [sort, setSort] = useState<SearchStudentsQuery["sort"]>(() => parseSort(searchParams.get("sort")));
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get("page")) || 1));
  const [searchInputKey, setSearchInputKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (college) params.set("college", college);
    if (branch) params.set("branch", branch);
    if (graduationYear) params.set("year", graduationYear);
    if (skills.length > 0) params.set("skills", skills.join(","));
    if (sort && sort !== DEFAULT_SORT) params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, college, branch, graduationYear, skills, sort, page]);

  const query = useSearchStudents({
    search: search || undefined,
    college: college || undefined,
    branch: branch || undefined,
    graduationYear: graduationYear ? Number(graduationYear) : undefined,
    skills: skills.length > 0 ? skills : undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const hasActiveFilters = Boolean(
    search || college || branch || graduationYear || skills.length > 0 || sort !== DEFAULT_SORT,
  );

  function resetToFirstPage() {
    setPage(1);
  }

  function handleReset() {
    setSearch("");
    setCollege("");
    setBranch("");
    setGraduationYear("");
    setSkills([]);
    setSort(DEFAULT_SORT);
    setPage(1);
    setSearchInputKey((key) => key + 1);
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Students" description="Discover and connect with other students on HireSense AI." />

      <SearchInput
        key={searchInputKey}
        placeholder="Search by name…"
        defaultValue={search}
        onValueChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
      />

      <SearchFilters
        college={college}
        branch={branch}
        graduationYear={graduationYear}
        skills={skills}
        sort={sort}
        hasActiveFilters={hasActiveFilters}
        onCollegeChange={(value) => {
          setCollege(value);
          resetToFirstPage();
        }}
        onBranchChange={(value) => {
          setBranch(value);
          resetToFirstPage();
        }}
        onGraduationYearChange={(value) => {
          setGraduationYear(value);
          resetToFirstPage();
        }}
        onSkillsChange={(value) => {
          setSkills(value);
          resetToFirstPage();
        }}
        onSortChange={(value) => {
          setSort(value);
          resetToFirstPage();
        }}
        onReset={handleReset}
      />

      {query.isPending ? (
        <LoadingSkeleton variant="list" count={6} />
      ) : query.isError ? (
        <ErrorState description="Couldn't load students." onRetry={() => query.refetch()} />
      ) : query.data && query.data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.data.map((student) => (
              <StudentCard key={student.userId} student={student} />
            ))}
          </div>
          <Pagination meta={query.data.meta} onPageChange={setPage} />
        </>
      ) : hasActiveFilters ? (
        <EmptyState title="No students found" description="Try adjusting your search or filters." />
      ) : (
        <EmptyState title="No students yet" description="Check back soon as more students join HireSense AI." />
      )}
    </PageContainer>
  );
}
