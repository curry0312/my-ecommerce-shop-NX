"use client";

import { useEffect, useState } from "react";
import FormatAlignLeftOutlinedIcon from "@mui/icons-material/FormatAlignLeftOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import { navItems } from "apps/user-ui-frontend/src/config/constants";
import Link from "next/link";
import HeaderUser from "./HeaderUser";

export default function HeaderBottom() {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  //Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <div
      className={`w-full transition-all duration-300 ease-in-out ${
        isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"
      }`}
    >
      {/*All dropdown*/}
      <div
        className={`w-[80%] relative m-auto flex justify-between items-center ${
          isSticky ? "py-3" : "py-0"
        }`}
      >
        {/*DropDown header*/}
        <div
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2">
            <FormatAlignLeftOutlinedIcon style={{ color: "#fff" }} />
            <span className="text-white font-medium">All Department</span>
          </div>
          <KeyboardArrowDownOutlinedIcon style={{ color: "#fff" }} />
        </div>

        {/*DropDown menu*/}
        {open && (
          <div
            className={`absolute ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } left-0 w-[260px] h-[400px] bg-[#3489ff] shadow-lg`}
          ></div>
        )}

        {/*Navigation Links*/}
        <div className="flex items-center">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="px-5 font-medium text-lg"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div>{isSticky && <HeaderUser />}</div>
      </div>
    </div>
  );
}
