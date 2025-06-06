import { Metadata } from "next";
import FileManager from '@/app/file-manager'
import Image from "next/image"
import Banner from "./assets/banner_transparent.png"

export const metadata: Metadata = {
  title: "Destination Domino",
};

export default async function Page() {
  return (
    <div>
      <header className="w-full relative">
        <div className="text-3xl absolute bottom-4 left-1/2 -translate-x-1/2 text-white">Thanks for coming to the <strong>Destination Domino</strong> wedding!</div>
        <Image alt="Schlosshotel Kronberg" src={Banner} />
      </header>

      <FileManager />
    </div>
  )
}
