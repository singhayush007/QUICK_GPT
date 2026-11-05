import { Suspense, lazy, type ComponentProps, type ReactElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CodeBlock = lazy(() => import("./CodeBlock"));

type CodeElementProps = { className?: string; children?: unknown };

// Fenced code blocks arrive as <pre><code class="language-x">…</code></pre>
const markdownComponents: ComponentProps<typeof Markdown>["components"] = {
  pre: ({ children }) => {
    const code = (children as ReactElement<CodeElementProps> | undefined)?.props;
    const language = /language-([\w+-]+)/.exec(code?.className || "")?.[1];
    const text = String(code?.children ?? "").replace(/\n$/, "");
    return (
      <Suspense
        fallback={<pre className="my-3 overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-[0.82rem] text-slate-300">{text}</pre>}
      >
        <CodeBlock language={language} code={text} />
      </Suspense>
    );
  },
  a: ({ children, node: _node, ...props }) => (
    <a {...props} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

/** Renders assistant Markdown (GFM tables, lists, highlighted code). */
export default function MarkdownContent({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {children}
    </Markdown>
  );
}
