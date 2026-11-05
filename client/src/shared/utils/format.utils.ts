/** Indian-style number formatting: 1,23,456.78 */
export function inr(n: number | null | undefined, digits = 2): string {
  return n == null
    ? "—"
    : n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Short title from free text: cut at a word boundary, drop dangling punctuation, add "…". Mirrors the server's makeTitle(). */
export function makeTitle(text: string, max = 40): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  let cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max / 2) cut = cut.slice(0, lastSpace);
  return `${cut.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/** Markdown -> plain text so text-to-speech doesn't read "asterisk asterisk". */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " code block omitted. ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#>|~-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
