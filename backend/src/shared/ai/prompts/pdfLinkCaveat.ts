// Shared across every AI prompt that scores or matches a resume (resume-analysis,
// job-description-analysis): resume text comes from a PDF text-extraction library,
// and links (GitHub/LinkedIn/Portfolio/LeetCode) are frequently stored as PDF
// hyperlink annotations rather than visible URL text, so their absence from the
// extracted text is not evidence they don't exist.
export const PDF_LINK_CAVEAT =
  'The resume text was extracted from a PDF using a text-extraction library. Clickable hyperlinks ' +
  '(GitHub, LinkedIn, LeetCode, portfolio, personal website, etc.) are frequently stored as PDF ' +
  'hyperlink annotations and may not appear as visible URL text even when the underlying link exists. ' +
  'Therefore: never deduct score or penalize because an explicit profile URL is missing or unverifiable. ' +
  'Never recommend adding a GitHub, LinkedIn, portfolio, or LeetCode link solely because no URL text is ' +
  'present - only recommend adding one of these if there is clear evidence the corresponding label or ' +
  'section does not exist at all. If a label like "GitHub" or "LinkedIn" is present without a visible URL, ' +
  'assume it may represent a working hyperlink. If you are uncertain whether a link exists, state that ' +
  'explicitly as a limitation rather than treating it as a weakness.';
