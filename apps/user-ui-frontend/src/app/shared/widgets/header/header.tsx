import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
            <Link href="/">
                <span className="text-2xl font-600">Eshop</span>
            </Link>
        </div>
      </div>
    </div>
  );
}
