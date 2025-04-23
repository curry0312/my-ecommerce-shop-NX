"use client";

import { SIDEBARROUTES } from "apps/seller-ui-frontend/src/config/sidebarRoute";
import useSeller from "apps/seller-ui-frontend/src/hooks/useSeller";
import useSidebar from "apps/seller-ui-frontend/src/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import SidebarMenu from "./Sidebar.menu";
import SidebarItem from "./Sidebar.item";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";

export default function Sidebar() {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { seller } = useSeller();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      setActiveSidebar(pathname);
    }
  }, [pathname, setActiveSidebar]);

  return (
    <div>
      <div className="p-2 flex items-center justify-center gap-2">
        <ShoppingBagIcon />
        <div className="flex flex-col items-center">
          <h3 className="text-xl">{seller?.shop.name}</h3>
          <h5 className="text-xs">{seller?.shop.address}</h5>
        </div>
      </div>
      <SidebarItem
        href="/dashboard"
        title="Dashboard"
        icon={<DashboardCustomizeOutlinedIcon />}
        isActive={pathname === "/dashboard"}
      />
      <div className="mt-2">
        {SIDEBARROUTES.map((item) => (
          <SidebarMenu key={item.title} title={item.title}>
            {item.routes.map((route) => (
              <SidebarItem
                key={route.href}
                href={route.href}
                title={route.title}
                icon={route.icon}
                isActive={activeSidebar === route.href}
              />
            ))}
          </SidebarMenu>
        ))}
      </div>
    </div>
  );
}
