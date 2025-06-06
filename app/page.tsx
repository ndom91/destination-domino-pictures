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
      <Image alt="Schlosshotel Kronberg" src={Banner} />
      <FileManager />
    </div>
  )
}
