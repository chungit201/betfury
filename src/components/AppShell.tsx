"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`app ${collapsed ? "opened-left-panel-short" : "opened-left-panel"}`}
      data-v-6f8a5598=""
      style={{ "--left-panel-width": collapsed ? "52px" : "232px" } as CSSProperties}
    >
      <Header onToggleSidebar={() => setCollapsed((c) => !c)} />
      <Sidebar collapsed={collapsed} />
      {children}
    </div>
  );
}
