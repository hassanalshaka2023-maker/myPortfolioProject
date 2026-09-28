import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Paragraphs starting with [TODO] are placeholders for missing content — hidden in production. */
export function stripTodos(text: string) {
  if (process.env.NODE_ENV !== "production") return text;
  return text
    .split(/\n{2,}/)
    .filter((block) => !block.trim().startsWith("[TODO]"))
    .join("\n\n");
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  const content = stripTodos(children).trim();
  if (!content) return null;

  return (
    <div className={cn("space-y-5 text-pretty leading-relaxed text-muted-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h3 className="pt-4 text-2xl font-semibold tracking-heading text-foreground" {...p} />,
          h2: (p) => <h3 className="pt-4 text-2xl font-semibold tracking-heading text-foreground" {...p} />,
          h3: (p) => <h4 className="pt-2 text-xl font-semibold tracking-heading text-foreground" {...p} />,
          a: ({ href, ...p }) => (
            <a
              href={href}
              className="font-medium text-brand-text underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand"
              {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              {...p}
            />
          ),
          strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
          ul: (p) => <ul className="list-disc space-y-2 ps-5 marker:text-brand" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-2 ps-5 marker:text-brand" {...p} />,
          blockquote: (p) => <blockquote className="border-s-2 border-brand/60 ps-4 italic" {...p} />,
          code: ({ className: c, ...p }) =>
            c ? (
              <code className={cn("font-mono text-sm", c)} {...p} />
            ) : (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground" {...p} />
            ),
          pre: (p) => <pre className="overflow-x-auto rounded-xl border bg-card p-4 text-sm" dir="ltr" {...p} />,
          p: ({ children: c, ...p }) => (
            <p {...p} className={cn(String(c).startsWith("[TODO]") && "rounded-lg border border-dashed border-brand/40 bg-brand/5 p-3 text-sm text-brand-text")}>
              {c}
            </p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
