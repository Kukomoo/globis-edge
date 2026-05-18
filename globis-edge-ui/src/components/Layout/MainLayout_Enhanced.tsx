import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar_Enhanced } from "./Topbar_Enhanced";
import { SyntheticWatermark } from "../UI/SyntheticWatermark";

export function MainLayout_Enhanced({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar_Enhanced />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
      <SyntheticWatermark />
    </div>
  );
}
