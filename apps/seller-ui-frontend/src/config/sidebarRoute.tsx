import EmailIcon from "@mui/icons-material/Email";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LogoutIcon from "@mui/icons-material/Logout";
import DiscountIcon from '@mui/icons-material/Discount';

import type { ReactNode } from "react";

type SidebarItem = {
  title: string;
  icon: ReactNode;
  href: string;
};

type SidebarGroup = {
  title: string;
  routes: SidebarItem[];
};

export const SIDEBARROUTES: SidebarGroup[] = [
  {
    title: "Main Menu",
    routes: [
      {
        title: "Orders",
        icon: <FormatListBulletedIcon />,
        href: "/dashboard/orders",
      },
      {
        title: "Payments",
        icon: <MonetizationOnIcon />,
        href: "/dashboard/payments",
      },
    ],
  },
  {
    title: "Products",
    routes: [
      {
        title: "All Products",
        icon: <ListAltIcon />,
        href: "/dashboard/all-products",
      },
      {
        title: "Create Product",
        icon: <AddBoxIcon />,
        href: "/dashboard/create-product",
      },
    ],
  },
  {
    title: "Others",
    routes: [
      {
        title: "Discount Codes",
        icon: <DiscountIcon />,
        href: "/dashboard/discount-code",
      },
      {
        title: "Mailbox",
        icon: <EmailIcon />,
        href: "/dashboard/inbox",
      },
      {
        title: "Notification",
        icon: <NotificationsActiveIcon />,
        href: "/dashboard/notification",
      },
      {
        title: "Settings",
        icon: <SettingsIcon />,
        href: "/dashboard/settings",
      },
      {
        title: "Logout",
        icon: <LogoutIcon />,
        href: "/login",
      },
    ],
  },
];
