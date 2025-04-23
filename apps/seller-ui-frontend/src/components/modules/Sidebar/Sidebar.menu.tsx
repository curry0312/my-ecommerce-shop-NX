import React from "react";

type SidebarMenuProps = { title: string; children: React.ReactNode };

export default function SidebarMenu({ title, children }: SidebarMenuProps) {
  return (
    <div className="flex flex-col space-y-1">
      <h3 className="text-xs tracking-[0.04rem] pl-1 my-2">{title}</h3>
      {children}
    </div>
  );
}
