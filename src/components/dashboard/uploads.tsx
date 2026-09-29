"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FileTextIcon, ImagePlusIcon, Loader2Icon, RefreshCwIcon, Trash2Icon, UploadCloudIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createUpload } from "@/server/actions/upload";

type Folder = "projects" | "avatar" | "cv" | "misc";
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml";

/** Uploads straight from the browser to storage via a signed URL; returns the public URL. */
export function useUpload(folder: Folder) {
  const t = useTranslations("dashboard.upload");
  const [pending, setPending] = useState(0);

  async function upload(file: File): Promise<string | null> {
    setPending((n) => n + 1);
    try {
      const res = await createUpload({ folder, filename: file.name, contentType: file.type, size: file.size });
      if (!res.ok) {
        const key = res.error === "unsupportedType" || res.error === "tooLarge" || res.error === "storage" ? res.error : "failed";
        toast.error(t(key));
        return null;
      }
      const put = await fetch(res.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "content-type": file.type, "cache-control": "max-age=31536000", "x-upsert": "false" },
      });
      if (!put.ok) throw new Error(`HTTP ${put.status}`);
      return res.data.publicUrl;
    } catch (error) {
      console.error("[upload]", error);
      toast.error(t("failed"));
      return null;
    } finally {
      setPending((n) => n - 1);
    }
  }

  return { upload, uploading: pending > 0 };
}

/** Single image with drag-and-drop, preview, replace and remove. */
export function ImageUpload({
  value,
  onChange,
  folder,
  aspect = "aspect-[16/10]",
  className,
  id,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: Folder;
  aspect?: string;
  className?: string;
  id?: string;
}) {
  const t = useTranslations("dashboard");
  const input = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload(folder);
  const [over, setOver] = useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    const url = await upload(file);
    if (url) onChange(url);
  };

  return (
    <div className={className}>
      <input id={id} ref={input} type="file" accept={IMAGE_ACCEPT} className="sr-only" onChange={(e) => handle(e.target.files?.[0]).then(() => (e.target.value = ""))} />
      {value ? (
        <div className={cn("group relative overflow-hidden rounded-xl border bg-muted", aspect)}>
          <Image src={value} alt="" fill sizes="480px" className="object-cover" />
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <Button type="button" size="sm" variant="glass" onClick={() => input.current?.click()} disabled={uploading}>
              {uploading ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
              {t("common.replace")}
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")}>
              <Trash2Icon />
              {t("common.remove")}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            handle(e.dataTransfer.files[0]);
          }}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-foreground/[0.02] p-6 text-center text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground",
            aspect,
            over && "border-brand bg-brand/5",
          )}
        >
          {uploading ? <Loader2Icon className="size-6 animate-spin text-brand-text" /> : <UploadCloudIcon className="size-6" />}
          <span className="font-medium text-foreground">{uploading ? t("common.uploading") : t("upload.drop")}</span>
          <span className="text-xs">{t("upload.hint")}</span>
        </button>
      )}
    </div>
  );
}

/** Multiple images: add several at once, remove, and reorder with arrows. */
export function GalleryUpload({ value, onChange, folder, max = 20 }: { value: string[]; onChange: (urls: string[]) => void; folder: Folder; max?: number }) {
  const t = useTranslations("dashboard");
  const input = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload(folder);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = Math.max(0, max - value.length);
    const urls = await Promise.all([...files].slice(0, room).map(upload));
    onChange([...value, ...urls.filter((u): u is string => !!u)]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  return (
    <div className="grid gap-3">
      <input ref={input} type="file" multiple accept={IMAGE_ACCEPT} className="sr-only" onChange={(e) => addFiles(e.target.files).then(() => (e.target.value = ""))} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((url, i) => (
          <li key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
            <Image src={url} alt="" fill sizes="240px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <div className="flex gap-1">
                <IconBtn label="←" onClick={() => move(i, i - 1)} disabled={i === 0}>
                  ‹
                </IconBtn>
                <IconBtn label="→" onClick={() => move(i, i + 1)} disabled={i === value.length - 1}>
                  ›
                </IconBtn>
              </div>
              <IconBtn label={t("common.remove")} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <XIcon className="size-3.5" />
              </IconBtn>
            </div>
            <span className="absolute start-2 top-2 rounded-md bg-black/60 px-1.5 font-mono text-[0.65rem] text-white">{i + 1}</span>
          </li>
        ))}
        {value.length < max && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={uploading}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
            >
              {uploading ? <Loader2Icon className="size-5 animate-spin text-brand-text" /> : <ImagePlusIcon className="size-5" />}
              {uploading ? t("common.uploading") : t("upload.addImages")}
            </button>
          </li>
        )}
      </ul>
      <p className="text-xs text-muted-foreground">
        {value.length}/{max} · {t("upload.hint")}
      </p>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 place-items-center rounded-md bg-white/15 text-sm text-white backdrop-blur transition-colors hover:bg-white/30 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** Non-image file (CV). Shows the current file name with open/replace/remove. */
export function FileUpload({ value, onChange, folder, accept = "application/pdf", id }: { value: string; onChange: (url: string) => void; folder: Folder; accept?: string; id?: string }) {
  const t = useTranslations("dashboard");
  const input = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload(folder);
  const name = value ? decodeURIComponent(value.split("/").pop() ?? "") : "";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-foreground/[0.02] p-3">
      <input
        id={id}
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const url = await upload(file);
          if (url) onChange(url);
        }}
      />
      <span className="grid size-10 place-items-center rounded-lg border bg-card text-brand-text">
        <FileTextIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        {value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium hover:underline" dir="ltr">
            {name}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">{t("upload.cvHint")}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()} disabled={uploading}>
          {uploading ? <Loader2Icon className="animate-spin" /> : <UploadCloudIcon />}
          {value ? t("common.replace") : t("common.upload")}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
            <Trash2Icon />
            <span className="sr-only">{t("common.remove")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
