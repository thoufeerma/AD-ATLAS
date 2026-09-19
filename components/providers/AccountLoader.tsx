"use client";

import { useEffect } from "react";
import { refreshAccount } from "@/lib/account";

/** Asks the API who's signed in, once per page load. Renders nothing. */
export default function AccountLoader() {
  useEffect(() => {
    void refreshAccount();
  }, []);
  return null;
}
