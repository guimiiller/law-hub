import Link from "next/link"

export default function HeaderLogo() {
    return(
        <header className="w-full flex items-center justify-center border-b border-gray-300 py-4 absolute top-0">
            <div className="flex items-center justify-between w-full px-5">
                <div className=" text-black text-3xl font-bold " ><Link href={'/'} >Law Hub</Link></div>
            </div>
        </header>
    )
}