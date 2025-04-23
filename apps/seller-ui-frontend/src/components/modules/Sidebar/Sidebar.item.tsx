import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
};

export default function SidebarItem({ icon, title, isActive, href }: Props) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[#3489FF] hover:text-white ${
        isActive && "bg-[#3489FF] text-white scale-[.95]"
      }`}
    >
      {icon}
      <h5 className="text-slate-200 text-lg">{title}</h5>
    </Link>
  );
}
