"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "netnot:color-scheme";

// Dijalankan inline di <head> sebelum paint supaya tidak ada kilatan tema
// yang salah. Pilihan manual disimpan; tanpa itu ikut setelan sistem.
export const COLOR_SCHEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

const getScheme = () => document.documentElement.dataset.theme ?? "light";

export function ColorSchemeToggle() {
  const scheme = useSyncExternalStore(subscribe, getScheme, () => "light");
  const next = scheme === "dark" ? "light" : "dark";

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="size-9 rounded-full text-muted-foreground hover:text-foreground"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
}
