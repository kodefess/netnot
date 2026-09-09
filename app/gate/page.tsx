"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGate } from "@/components/gate/gate-field";

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        // Reload penuh supaya middleware baca ulang cookie & buka halaman asli
        window.location.href = "/";
        return;
      }

      if (data.locked) {
        // Navigasi ke path yang tidak ada -> otomatis kena app/not-found.tsx
        router.push("/percobaan-habis");
        return;
      }

      setError(`Password salah. Sisa percobaan: ${data.attemptsLeft}`);
      setPassword("");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--app-line)] bg-[var(--app-panel)] p-8 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.35)]">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--app-accent)] text-white">
          <Lock className="h-5 w-5" strokeWidth={2} />
        </div>

        <h1 className="mb-1.5 font-serif text-xl italic text-[var(--app-ink)]">
          Halaman terkunci
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[var(--app-ink)]/60">
          Masukkan password untuk mengakses halaman ini.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGate
            id="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            autoFocus
          />

          {error && (
            <Alert
              variant="destructive"
              className="border-[var(--app-accent)]/30 bg-[var(--app-accent)]/6 [&>svg]:text-[var(--app-accent)]"
            >
              <AlertDescription className="text-[13px] text-[var(--app-accent)]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading || !password}
            className="h-10 w-full rounded-[10px] bg-[var(--app-ink)] font-medium text-white hover:bg-[color-mix(in_srgb,var(--app-ink)_88%,var(--app-accent))] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memeriksa...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
