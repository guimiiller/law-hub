"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 z-50 w-full">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-[-0.03em] text-[#111116] sm:text-2xl"
        >
          Law Hub
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#55565C] transition-colors hover:bg-[#ECECEF] hover:text-[#111116]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-[#111116] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#25252B]"
          >
            Começar
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="relative z-60 flex h-10 w-10 items-center justify-center rounded-lg border border-[#DDDEE3] bg-white md:hidden"
        >
          <div className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-5 rounded-full bg-[#111116] transition-all duration-300 ${
                open ? "top-1.75 rotate-45" : ""
              }`}
            />

            <span
              className={`absolute left-0 top-1.75 h-[1.5px] w-5 rounded-full bg-[#111116] transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />

            <span
              className={`absolute left-0 top-1.75 h-[1.5px] w-5 rounded-full bg-[#111116] transition-all duration-300 ${
                open ? "top-1.75 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-[#F7F7F8] transition-all duration-300 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-6 pt-28">
          <nav className="flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="border-b border-[#E3E3E6] py-5 text-2xl font-medium tracking-[-0.03em] text-[#111116]"
            >
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="border-b border-[#E3E3E6] py-5 text-2xl font-medium tracking-[-0.03em] text-[#111116]"
            >
              Criar conta
            </Link>
          </nav>

          <div className="mt-auto pb-8">
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-[#111116] px-6 py-4 text-sm font-medium text-white"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
