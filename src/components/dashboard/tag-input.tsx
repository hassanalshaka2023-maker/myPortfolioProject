"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Chips input: Enter / comma adds, Backspace on empty removes the last, paste splits on commas. */
export function TagInput({
  value,
  onChange,
  id,
  placeholder,
  suggestions = [],
  invalid,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  id?: string;
  placeholder?: string;
  suggestions?: string[];
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tags = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const next = [...value];
    for (const tag of tags) if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) next.push(tag);
    onChange(next);
    setDraft("");
  };

  const open = suggestions.filter((s) => !value.includes(s) && (!draft || s.toLowerCase().includes(draft.toLowerCase()))).slice(0, 8);

  return (
    <div className="grid gap-2">
      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-foreground/[0.02] px-2 py-1.5 transition-[box-shadow,border-color] focus-within:border-brand/60 focus-within:ring-[3px] focus-within:ring-brand/20",
          invalid && "border-destructive",
        )}
        dir="ltr"
      >
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-md border bg-card py-0.5 pe-1 ps-2 font-mono text-xs">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="grid size-4 place-items-center rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={value.length === 0 ? placeholder : undefined}
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      {open.length > 0 && (
        <div className="flex flex-wrap gap-1.5" dir="ltr">
          {open.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-md border border-dashed px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
