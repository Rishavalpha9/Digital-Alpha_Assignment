"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      className="theme-toggle rounded-full px-3"
    >
      <Sun className="theme-toggle-sun h-4 w-4" aria-hidden />
      <Moon className="theme-toggle-moon h-4 w-4" aria-hidden />
      <span className="theme-toggle-label-light">Light</span>
      <span className="theme-toggle-label-dark">Dark</span>
    </Button>
  );
}
