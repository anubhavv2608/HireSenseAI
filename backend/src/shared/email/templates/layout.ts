export function emailLayout(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 600; margin: 0 0 24px;">HireSense AI</p>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
        You're receiving this because you have an account on HireSense AI.
      </p>
    </div>
  `.trim();
}
