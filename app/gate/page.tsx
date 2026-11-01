"use client";

import { useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  FileLock2,
  KeyRound,
  LoaderCircle,
  Lock,
  ReceiptText,
} from "lucide-react";

import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "locked" };

/** Nota wireframe biru, seperti ilustrasi wireframe di JOYCO Hub. */
function WireReceipt() {
  const width = 112;
  const height = 150;
  const teeth = 7;
  const tooth = width / teeth;
  let edge = `M0,0H${width}V${height}`;
  for (let i = 0; i < teeth; i++) {
    edge += `L${width - tooth * (i + 0.5)},${height - 7}L${width - tooth * (i + 1)},${height}`;
  }
  edge += "Z";
  const rows = Array.from({ length: 8 }, (_, i) => 16 + i * 16);
  const cols = [28, 56, 84];

  return (
    <svg viewBox="0 0 368 160" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <g transform="matrix(.82 .3 -.72 .5 196 22)">
        {/* Salinan bergeser memberi kesan ketebalan kertas. */}
        <path d={edge} transform="translate(-7 7)" opacity=".45" />
        <path d={edge} />
        {rows.map((y) => (
          <path key={y} d={`M0,${y}H${width}`} opacity=".7" />
        ))}
        {cols.map((x) => (
          <path key={x} d={`M${x},0V${height - 8}`} opacity=".7" />
        ))}
      </g>
    </svg>
  );
}

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
    <main className="gate">
      <aside className="gate-rail" aria-hidden>
        <span className="gate-logo">{SITE.brand.charAt(0)}</span>
        <span className="gate-tab">
          <span>Private</span>
          <Lock size={15} />
        </span>
        <span className="gate-box">
          <ReceiptText size={15} />
        </span>
        <span className="gate-box">
          <KeyRound size={15} />
        </span>
        <span className="gate-box">
          <FileLock2 size={15} />
        </span>
        <span className="gate-fill" />
        <span className="gate-box gate-diamond">
          <svg viewBox="0 0 16 16">
            <rect x="4" y="4" width="4" height="4" />
            <rect x="8" y="8" width="4" height="4" className="is-blue" />
            <rect x="8" y="4" width="4" height="4" className="is-dim" />
            <rect x="4" y="8" width="4" height="4" className="is-dim" />
          </svg>
        </span>
      </aside>

      <div className="gate-stage">
        <div className="gate-card">
          <div className="gate-strip">
            <span className={cn("gate-icon", locked && "is-locked")}>
              <Lock size={15} />
            </span>
            <span className="gate-label">
              {locked ? "Access paused" : "Private studio"}
              <kbd>{locked ? "10 MIN" : "↵"}</kbd>
            </span>
          </div>

          <div className="gate-art">
            <i className="gate-corner is-tl" />
            <i className="gate-corner is-tr" />
            <i className="gate-corner is-bl" />
            <i className="gate-corner is-br" />
            <WireReceipt />
          </div>

          <div className="gate-body">
            <span className="gate-chip">{locked ? "Locked" : "Sign in"}</span>
            <h1>{locked ? "Too many attempts" : SITE.title}</h1>
            <p>
              {locked
                ? "For security, sign-in is paused. Try again in about 10 minutes."
                : "This studio is private. Enter the password to continue."}
            </p>

            <form onSubmit={submit} className="gate-form">
              <div className="gate-field">
                <input
                  id="password"
                  className="gate-input"
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
                />
                <button
                  type="button"
                  className="gate-eye"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Hide password" : "Show password"}
                  disabled={locked}
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {status.kind === "error" && (
                <p role="alert" className="gate-error">
                  <CircleAlert size={15} className="shrink-0" />
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                className="gate-submit"
                disabled={!password || loading || locked}
              >
                {loading ? "Checking…" : "Continue"}
                {loading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
