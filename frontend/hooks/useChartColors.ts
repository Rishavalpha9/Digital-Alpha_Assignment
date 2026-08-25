"use client";

import { useMemo } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";
import { readCssVar } from "@/lib/theme";

export function useChartColors() {
  const { theme } = useTheme();

  return useMemo(() => {
    const isDark =
      theme === "dark" ||
      (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

    return {
      isDark,
      ink: readCssVar("--ink", isDark ? "#f4efe6" : "#1c1915"),
      muted: readCssVar("--muted", isDark ? "#b7aea0" : "#6f675c"),
      line: readCssVar("--line", isDark ? "#3b342b" : "#e6dccb"),
      surface: readCssVar("--surface", isDark ? "#1c1914" : "#fffbf4"),
      success: readCssVar("--success", isDark ? "#4fba93" : "#0f6e56"),
      gold: readCssVar("--gold", isDark ? "#e0b13a" : "#b8860b"),
    };
  }, [theme]);
}
