"use client";

import { useAtom } from "jotai";
import { activeSideBarItem } from "../config/constants";

export default function useSidebar() {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem);
  return { activeSidebar, setActiveSidebar };
}
