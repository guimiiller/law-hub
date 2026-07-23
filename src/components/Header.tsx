"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full flex items-center justify-center py-4 absolute top-0 z-50">
      <div className="flex items-center justify-between w-full max-w-6xl px-4 md:px-6">
        <div className="text-black text-xl md:text-2xl font-bold">Law Hub</div>

        <div className="hidden md:flex items-center gap-3">
          <Link href={"/login"}>
            <button className="border border-black px-4 py-2 text-base text-black rounded-lg transition hover:bg-black hover:text-white">
              Login
            </button>
          </Link>

          <Link href={"/register"}>
            <button className="bg-black px-4 py-2 text-base text-white rounded-lg transition">
              Começar
            </button>
          </Link>
        </div>

        {/* HAMBURGER (MOBILE) */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-between w-7 h-5 z-50"
        >
          <span
            className={`h-0.75 w-full bg-black rounded transition-all duration-300 ${
              open ? "rotate-45 translate-y-2.25" : ""
            }`}
          />
          <span
            className={`h-0.75 w-full bg-black rounded transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.75 w-full bg-black rounded transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* MENU MOBILE */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-8 text-lg transition-all duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <Link href="/login" onClick={() => setOpen(false)}>
          <button className="border border-black px-6 py-3 rounded-lg">
            Login
          </button>
        </Link>

        <Link href="/register" onClick={() => setOpen(false)}>
          <button className="bg-black text-white px-6 py-3 rounded-lg">
            Começar
          </button>
        </Link>
      </div>
    </header>
  );
}
