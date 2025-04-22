import Link from "next/link";
import React from "react";
import { Search } from "lucide-react";
import HeaderBottom from "./HeaderBottom";
import HeaderUser from "./HeaderUser";

export default function Header() {
  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-2xl font-[600]">Eshop</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search here"
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>
        <HeaderUser />
      </div>
      <div className="border-b border-b-slate-500">
        <HeaderBottom />
      </div>
    </div>
  );
}
