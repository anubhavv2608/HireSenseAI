/** Verifies a file's actual bytes match its claimed MIME type via magic-byte
 * sniffing, so a renamed/relabeled file can't slip past the client-supplied
 * Content-Type/extension checks in validateFile(). Covers exactly the MIME
 * types STORAGE_CONSTANTS.ALLOWED_MIME_TYPES allows — intentionally not a
 * general-purpose file-type library (avoids an unpatched dependency for a
 * fixed, small set of signatures). */
const SIGNATURES: { mimetype: string; matches: (buffer: Buffer) => boolean }[] = [
  { mimetype: 'application/pdf', matches: (b) => b.subarray(0, 5).toString('ascii') === '%PDF-' },
  { mimetype: 'image/jpeg', matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mimetype: 'image/png',
    matches: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    mimetype: 'image/webp',
    matches: (b) =>
      b.length >= 12 &&
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

/** Returns the MIME type matching the buffer's magic bytes, or null if none of
 * the known signatures match. */
export function detectFileSignature(buffer: Buffer): string | null {
  return SIGNATURES.find((sig) => sig.matches(buffer))?.mimetype ?? null;
}
