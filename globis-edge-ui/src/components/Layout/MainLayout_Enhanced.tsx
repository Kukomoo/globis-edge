import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar_Enhanced } from "./Topbar_Enhanced";
import { SyntheticWatermark } from "../UI/SyntheticWatermark";

export function MainLayout_Enhanced({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--slate-canvas)" }}>
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
                   focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-[#424242]
                   focus:rounded-lg focus:shadow-lg focus:font-semibold focus:outline-none
                   focus:ring-2 focus:ring-[#93B1C2]"
      >
        Skip to main content
      </a>

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(26,32,40,0.55)", backdropFilter: "blur(2px)" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar — hidden on mobile, slide-in drawer when open ── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-56 flex-shrink-0 transition-transform duration-200 ease-out
          lg:relative lg:translate-x-0 lg:flex lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Topbar_Enhanced onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
          style={{ background: "var(--slate-canvas)" }}
          tabIndex={-1}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 min-h-full">
            {children}
          </div>
        </main>
      </div>

      <SyntheticWatermark />
    </div>
  );
}
