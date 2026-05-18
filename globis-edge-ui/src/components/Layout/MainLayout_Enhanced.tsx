import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar_Enhanced } from "./Topbar_Enhanced";
import { SyntheticWatermark } from "../UI/SyntheticWatermark";

export function MainLayout_Enhanced({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--surface-0)" }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
                   focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700
                   focus:rounded-lg focus:shadow-lg focus:font-semibold focus:outline-none
                   focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar_Enhanced />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
          style={{ background: "var(--surface-0)" }}
          tabIndex={-1}
        >
          <div className="max-w-3xl mx-auto px-8 py-10 min-h-full">
            {children}
          </div>
        </main>
      </div>
      <SyntheticWatermark />
    </div>
  );
}
