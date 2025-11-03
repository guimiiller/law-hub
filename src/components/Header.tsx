import Link from "next/link"

export default function Header() {
    return(
        <header className="w-full flex items-center justify-center py-4 absolute top-0">
            <div className="flex items-center justify-between w-full px-5">
                <div className=" text-black text-3xl font-bold " >Law Hub</div>
                <div>
                    <Link href={'/login'} ><button className="border border-black px-4 py-2 text-black rounded-lg cursor-pointer transition duration-300 hover:bg-black hover:text-white ">Login</button></Link>
                    <Link href={'/register'}><button className="bg-black px-4 py-3 text-white rounded-lg ml-2 cursor-pointer transition duration-300">Comece Agora</button> </Link>
                </div>
            </div>
        </header>
    )
}