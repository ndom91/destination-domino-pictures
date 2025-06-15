import type { Metadata } from "next";
import FileManager from "@/app/components/file-manager";
import Image from "next/image";
import Banner from "@/app/assets/banner_transparent.png";
import Footer from "@/app/components/footer";

export const metadata: Metadata = {
  title: "Destination Domino",
};

export default async function Page() {
  return (
    <div className="my-6 sm:my-16 w-full max-w-[90vw] sm:mx-0 sm:max-w-5/6">
      <div className="bg-gray-50 rounded-lg mb-8">
        <header className="w-full relative font-cursive flex justify-center items-end-safe h-52 sm:h-46 md:h-64 2xl:h-72">
          <div className="text-[2.5rem] sm:text-5xl lg:text-7xl w-3/4 2xl:w-1/3 text-balance text-center text-white z-2 mb-2 sm:mb-4 text-shadow-lg/20">
            Thanks for joining us at <strong className="font-bold">Destination Domino</strong>!
          </div>
          <Image
            alt="Schlosshotel Kronberg"
            src={Banner}
            className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-center h-52 sm:h-46 md:h-64 2xl:h-72"
          />
        </header>

        <FileManager />
      </div>
      <Footer />
    </div>
  );
}
