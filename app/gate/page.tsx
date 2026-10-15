"use client";

import { useState } from "react";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { controlClass } from "@/components/studio/section";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "locked" };

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const locked = status.kind === "locked";
  const loading = status.kind === "loading";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading || locked) return;
    setStatus({ kind: "loading" });

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data: { success?: boolean; locked?: boolean; attemptsLeft?: number } =
        await res.json().catch(() => ({}));

      if (data.success) {
        // Reload penuh supaya proxy membaca cookie baru dan menampilkan halaman asli.
        window.location.reload();
        return;
      }
      if (data.locked) {
        setStatus({ kind: "locked" });
        return;
      }
      setPassword("");
      setStatus({
        kind: "error",
        message:
          typeof data.attemptsLeft === "number"
            ? `Wrong password. ${data.attemptsLeft} ${data.attemptsLeft === 1 ? "attempt" : "attempts"} left.`
            : "Something went wrong. Please try again.",
      });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Please try again." });
    }
  };

  return (
    <main className="canvas grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border bg-surface p-7 shadow-panel sm:p-8">
        <span
          className={cn(
            "mb-6 grid size-11 place-items-center rounded-xl",
            locked ? "bg-danger/10 text-danger" : "bg-brand text-brand-foreground",
          )}
        >
          <Lock className="size-5" />
        </span>

        <h1 className="font-display text-3xl leading-tight">
          {locked ? "Too many attempts" : <>Welcome to <em>{SITE.title}</em></>}
        </h1>
        <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
          {locked
            ? "For security, sign-in is paused. Try again in about 10 minutes."
            : "This studio is private. Enter the password to continue."}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="relative">
            <Input
              id="password"
              type={visible ? "text" : "password"}
              aria-label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status.kind === "error") setStatus({ kind: "idle" });
              }}
              autoComplete="current-password"
              autoFocus
              disabled={locked}
              aria-invalid={status.kind === "error" || undefined}
              className={cn(controlClass, "h-11 pr-11")}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              disabled={locked}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {status.kind === "error" && (
            <p role="alert" className="flex items-center gap-2 text-[13px] text-danger">
              <CircleAlert className="size-4 shrink-0" />
              {status.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={!password || loading || locked}
            className="h-11 gap-2 rounded-lg text-[15px]"
          >
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Checking…
              </>
            ) : (
              <>
                Continue <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
