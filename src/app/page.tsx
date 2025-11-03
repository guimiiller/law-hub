import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex items-center justify-center h-screen text-center bg-[linear-gradient(to_bottom,_#EFF0F5_0%,_#DADBE0_46%)]">
        <div className="flex items-center justify-center max-w-4xl">
          <div>
            <h1 className=" text-black text-5xl font-bold md:text-6xl">Organize seu escritório jurídico em um só lugar.</h1>
            <h3 className=" text-black font-light mb-10 mt-7 md:text-2xl md:text-[22px] ">Simplifique sua rotina, controle prazos e mantenha tudo sob controle.</h3>
            <Link href={'/register'} ><button className=" bg-black px-5 py-4 text-white rounded-lg cursor-pointer transition duration-300 uppercase ">Experimente agora!</button></Link>
          </div>
        </div>
      </main>
    </>
  );
}
