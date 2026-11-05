/** Reads a fetch() body as Server-Sent Events, calling `onEvent` with each parsed `data:` frame. */
export async function readSSE<T>(response: Response, onEvent: (event: T) => void): Promise<void> {
  if (!response.body) throw new Error("Empty response");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (line) onEvent(JSON.parse(line.slice(5)) as T);
    }
  }
}
