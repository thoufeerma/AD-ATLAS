"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-[248px]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <Topbar onMenu={() => setOpen(true)} />
      <main className="px-4 py-6 lg:px-7">{children}</main>
      <footer className="flex flex-wrap items-center justify-between gap-2 px-4 pb-8 pt-4 text-[0.7rem] text-muted lg:px-7">
        <span>© 2025 Velastia. All Rights Reserved.</span>
        <span>Version 1.0.0</span>
      </footer>
    </div>
  );
}
