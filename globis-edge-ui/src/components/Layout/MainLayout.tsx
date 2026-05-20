import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SyntheticWatermark } from "../UI/SyntheticWatermark";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
      <SyntheticWatermark />
    </div>
  );
}
