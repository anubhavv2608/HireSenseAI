# AI Documentation

## Provider

All AI generation goes through Google Gemini (`@google/genai`), behind the `ILLMProvider`
interface (`GeminiProvider`, selected via `LLMProviderFactory`). Business logic never calls the
Gemini SDK directly — it calls `AIService`, which owns timeout/retry policy
(`AI_TIMEOUT_MS`/`AI_MAX_RETRIES`) and error mapping. See
[Architecture — AI request lifecycle](architecture.md#ai-request-lifecycle) for the full
prompt → generate → parse → normalize → persist pipeline shared by every AI module.

Every module asks Gemini for **structured output** against a hand-written `responseSchema`
(JSON-Schema-like, but not derived from the module's Zod schema via `z.toJSONSchema()`, since
Gemini's structured-output format isn't a strict JSON-Schema-2020-12 dialect). The corresponding
Zod schema is the second, independent gate — Gemini's own schema constrains what shape comes back,
and `safeParse` against the Zod schema is what the code actually trusts before persisting anything.

## AI modules

| Module | Input | Produces |
|---|---|---|
| `resume-parser` | Resume PDF text | Structured resume: contact info, education, experience, skills, projects |
| `resume-analysis` | Structured resume | `categoryScores` (6 flat dimensions, unchanged for backward compatibility) **and** `detailedScores` (8 named dimensions — ATS compatibility, resume structure, technical skills, projects, experience, education, achievement quality, overall — each with `score`, `explanation`, `strengths`, `weaknesses`, `improvements`), plus resume-wide `missingSections`, `strengths`, `weaknesses`, `recommendations` |
| `job-description-analysis` | Structured resume + raw job description text | Matching/missing skills, `extractedRequirements` (languages, frameworks, libraries, databases, responsibilities, required/preferred qualifications, soft skills), `learningRoadmap` |
| `interview-generator` | Structured resume (+ JD analysis, if available) | Interview questions across categories/difficulties, referencing the candidate's actual projects/technologies by name where possible |

`categoryScores` and `detailedScores` are deliberately two separate objects on
`resume-analysis`, not one merged/renamed field — the frontend already reads `categoryScores.*`,
so introducing `detailedScores` as a new, additive, nullable field keeps every existing analysis
record (and every existing frontend read) working unchanged.

## The PDF hyperlink caveat

`PdfExtractionService` only reads a PDF's text layer. Hyperlinks (GitHub, LinkedIn, LeetCode,
portfolio) are frequently stored as PDF *annotations* rather than visible URL text, so their
absence from extracted text is not evidence they don't exist. Every prompt that could plausibly
score or comment on a resume's links (`resume-analysis`, `job-description-analysis`) interpolates
the shared `PDF_LINK_CAVEAT` constant (`shared/ai/prompts/pdfLinkCaveat.ts`), which instructs the
model to:

- never deduct score or penalize for a missing/unverifiable profile URL;
- never recommend adding a link solely because no URL text is present in the extracted text;
- treat a bare label (e.g. "GitHub" with no visible URL) as possibly representing a working link;
- state uncertainty explicitly as a limitation rather than treating it as a weakness.

## Deterministic post-processing (never trust the model's arithmetic or claims)

After a Zod `safeParse` succeeds, every module runs a normalization pass before persisting or
responding — the model's raw output is never returned to the frontend as-is:

- **Score clamping** — scores are treated as being in the model's stated range; the response
  schema itself constrains this at the type level.
- **String-array de-duplication** — `dedupeStrings()` (`shared/utils/dedupeStrings.ts`) removes
  case/whitespace-insensitive duplicates from every recommendation/strength/weakness/improvement
  list, since models frequently repeat near-identical phrasing across fields.
- **Reconciliation against ground truth** — `resume-analysis`'s `reconcileAndNormalize()` drops any
  AI-claimed `missingSections` entry that the parser's own `StructuredResume` shows is actually
  present, so the model can't flag a section as missing when the code already knows it exists.
  `job-description-analysis`'s `normalizeJdAnalysis()` applies the same principle to
  `missingSkills` vs. the (deduped) `matchingSkills` list — a skill can't be claimed as both
  matching and missing.
- **Backward-compatible nullability** — new fields (`detailedScores`, `extractedRequirements`,
  `learningRoadmap`) are nullable on older, already-persisted records. The "skip re-analysis, reuse
  the cached result" code path has its own looser `SkippedAnalysisUpdate` type that allows `null`
  for just these new fields, so an old record from before this fields existed doesn't throw when
  it's read back — while a **fresh** AI result is still required to populate them.

## Interview generator scope

Unlike the other three AI modules, `interview-generator` intentionally received only a prompt-
wording reinforcement this cycle ("reference actual project names/technologies/companies by name
in the question text and `relatedSkill`") — no schema or type changes. It was already scoped
correctly (resume-grounded, correct category/difficulty structure) and didn't need the
detailed-scoring/extraction treatment the other modules got.
