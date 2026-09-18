"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/lib/api/types";

/**
 * Store settings from the API (support contacts, the live welcome code,
 * shipping threshold), fetched once in the root layout and shared with
 * client components. Server components call `getSettings()` directly.
 */
const SettingsContext = createContext<Settings | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  return <SettingsContext value={settings}>{children}</SettingsContext>;
}

export function useSettings(): Settings {
  const settings = useContext(SettingsContext);
  if (!settings) throw new Error("useSettings must be used inside <SettingsProvider>");
  return settings;
}
