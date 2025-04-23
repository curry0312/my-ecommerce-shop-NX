import Sidebar from "apps/seller-ui-frontend/src/components/modules/Sidebar/Sidebar";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-black min-h-screen">
      <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-700 text-white p-4">
        <div className="sticky top-0">
          <Sidebar />
        </div>
      </aside>

      <main className="flex-1">
        <div className="overflow-auto">{children}</div>
      </main>
    </div>
  );
}
