"use client";

import Link from "next/link";
import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import useUser from "apps/user-ui-frontend/src/hooks/useUser";

export default function HeaderUser() {
  const { user, isLoading } = useUser();
  console.log(user);
  return (
    <div className="flex items-center gap-8">
      {!isLoading && user ? (
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full "
          >
            <PersonIcon style={{ color: "#3489FF", fontSize: "2rem" }} />
          </Link>
          <Link href="/profile">
            <span className="block font-medium">Hello, </span>
            <span className="block font-bold">{user.name}</span>
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full "
          >
            <PersonIcon style={{ color: "#3489FF", fontSize: "2rem" }} />
          </Link>
          <Link href="/login">
            <span className="block font-medium">Hello, </span>
            <span className="block font-bold">{isLoading ? "..." : "Sign in"}</span>
          </Link>
        </div>
      )}
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
  );
}
