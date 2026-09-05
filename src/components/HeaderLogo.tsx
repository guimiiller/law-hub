import Link from "next/link";

export default function HeaderLogo() {
  return (
    <header className="absolute top-0 left-0 z-50 w-full border-b border-[#E6E6E9] bg-[#F7F7F8]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-[-0.03em] text-[#111116] sm:text-2xl"
        >
          Law Hub
        </Link>
      </div>
    </header>
  );
}
