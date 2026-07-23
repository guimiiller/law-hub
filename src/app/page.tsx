import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex items-center justify-center min-h-screen text-center bg-[linear-gradient(to_bottom,#EFF0F5_0%,#DADBE0_46%)] px-4">
        <div className="max-w-3xl">
          <h1 className="text-black font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
            Organize seu escritório jurídico em um só lugar.
          </h1>

          <h3 className="text-black font-light mt-5 mb-8 text-base sm:text-lg md:text-xl">
            Simplifique sua rotina, controle prazos e mantenha tudo sob
            controle.
          </h3>

          <Link href={"/register"}>
            <button className="bg-black px-5 py-3 text-sm sm:text-base md:px-6 md:py-4 text-white rounded-lg transition uppercase">
              Experimente agora
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
