import { Metadata } from "next";
import FileManager from '@/app/components/file-manager'
import Image from "next/image"
import Banner from "@/app/assets/banner_transparent.png"
import Footer from "@/app/components/footer";

export const metadata: Metadata = {
  title: "Destination Domino",
};

export default async function Page() {
  return (
    <div className="my-16 w-full mx-4 sm:mx-0 sm:max-w-5/6">
      <div className="bg-stone-50 border-2 border-gray-100 rounded-xl mb-4">
        <header className="w-full relative font-cursive">
          <div className="text-6xl text-pretty text-center absolute bottom-4 left-1/2 -translate-x-1/2 text-white">Thanks for joining us at <strong>Destination Domino</strong>!</div>
          <Image alt="Schlosshotel Kronberg" src={Banner} className="" />
        </header>

        <FileManager />
      </div>
      <Footer />
    </div>
  )
}
