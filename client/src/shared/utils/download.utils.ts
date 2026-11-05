/** Trigger a browser download for an in-memory blob. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, type = "text/markdown"): void {
  downloadBlob(filename, new Blob([text], { type }));
}

/** Download a (possibly cross-origin) file by fetching it first, so the browser saves instead of navigating. */
export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  const blob = await (await fetch(url)).blob();
  downloadBlob(filename, blob);
}
