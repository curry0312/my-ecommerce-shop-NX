import Link from "next/link";
import React from "react";
import { Search } from "lucide-react";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import HeaderBottom from "./header-bottom";

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
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full "
            >
              <PersonIcon style={{ color: "#3489FF", fontSize: "2rem" }} />
            </Link>
            <Link href="/register">
              <span className="block font-medium">Hello, </span>
              <span className="block font-bold">Sign in</span>
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/cart" className="relative">
              <ShoppingCartOutlinedIcon />
              <div className="w-6 h-6 border-2 border-white bg-[#3489FF] rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="block text-white font-medium">0</span>
              </div>
            </Link>
            <Link href="/wishlist" className="relative">
              <FavoriteBorderIcon />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="block text-white font-medium">0</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-slate-500">
        <HeaderBottom />
      </div>
    </div>
  );
}
