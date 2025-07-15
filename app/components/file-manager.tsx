"use client";

import { toast } from "sonner";
import type { FileObject } from "@/app/lib/r2";
import { getSignedUrlForUpload, listFiles } from "@/app/lib/r2-actions";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import useLocalStorage from "@/hooks/use-localStorage";
import File from "@/app/components/file";

export default function FileManager() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useLocalStorage("userId", null, () => crypto.randomUUID());

  const fetchFiles = async () => {
    try {
      const data = await listFiles(userId);
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Error fetching files");
      setFiles([]);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: on purpose
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (const file of e.target.files) {
        await handleUpload(file);
      }
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Max upload size 25mb
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size exceeds 25MB limit");
      return;
    }

    // Filter file type
    const allowedFileTypes = ["image/png", "image/jpeg", "image/gif", "image/heic", "image/svg+xml"];
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("File type not supported");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      const signedUrl = await getSignedUrlForUpload(`${userId}/${file.name}`, file.type);

      await uploadFileWithProgress(file, signedUrl, abortControllerRef.current.signal);

      toast.success("File uploaded successfully!");
      fetchFiles();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.info("Upload cancelled");
      } else {
        console.error("Error uploading file:", error);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  };

  const uploadFileWithProgress = (file: File, signedUrl: string, signal: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", signedUrl);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        toast.error(`Error uploading file ${file.name}, please try again`);
        reject();
      };

      xhr.send(file);

      signal.addEventListener("abort", () => {
        xhr.abort();
        toast.error(`Error uploading file ${file.name}, please try again`);
        reject();
      });
    });
  };

  return (
    <div className="file-manager relative flex flex-1 flex-col gap-8 p-4 sm:p-8 rounded-b-lg border-1 border-gray-200">
      <div className="flex justify-center w-full gap-4">
        <div className="font-sans text-sm md:text-lg font-light tracking-tight text-stone-700 rounded-md text-pretty">
          Did you capture some beautiful pictures of you and your group? Snapshots of the groom looking nervous?{" "}
          {`We'd`} love them all! Any extra photos that {`didn't`} fit on your portable cameras are welcome here too.
        </div>
        <div className="font-sans text-sm md:text-lg font-light tracking-tight text-stone-700 rounded-md text-pretty">
          Habt ihr schöne Fotos von euch und eurer Gruppe gemacht? Schnappschüsse vom nervösen Bräutigam? Wir freuen uns
          über alle Fotos! Auch alle zusätzlichen Fotos, die nicht auf eure Einwegkameras passten, sind hier willkommen.
        </div>
      </div>
      <div className="flex flex-col relative gap-8">
        <div className="flex flex-col gap-2">
          <div className="ribbon ribbon-top-left -top-1 -left-1 pointer-events-none">
            <span className="">
              <div className="seal">
                <div className="embossed">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Camera</title>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <circle cx="12" cy="12" r="3.2" />
                    <path
                      filter="url(#Bevel2)"
                      d="M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
                    />
                    <filter id="Bevel" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="150%" height="150%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                      <feSpecularLighting
                        in="blur"
                        surfaceScale="5"
                        specularConstant="0.5"
                        specularExponent="10"
                        result="specOut"
                        lightingColor="white"
                      >
                        <fePointLight x="-5000" y="-10000" z="20000" />
                      </feSpecularLighting>
                      <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2" />
                      <feComposite
                        in="SourceGraphic"
                        in2="specOut2"
                        operator="arithmetic"
                        k1="0"
                        k2="1"
                        k3="1"
                        k4="0"
                        result="litPaint"
                      />
                    </filter>
                    <filter id="Bevel2" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="150%" height="150%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
                      <feSpecularLighting
                        in="blur"
                        surfaceScale="5"
                        specularConstant="0.5"
                        specularExponent="10"
                        result="specOut"
                        lightingColor="white"
                      >
                        <fePointLight x="-5000" y="-10000" z="0000" />
                      </feSpecularLighting>
                      <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2" />
                      <feComposite
                        in="SourceGraphic"
                        in2="specOut2"
                        operator="arithmetic"
                        k1="0"
                        k2="1"
                        k3="1"
                        k4="0"
                        result="litPaint"
                      />
                    </filter>
                  </svg>
                </div>
              </div>
            </span>
          </div>

          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-100 hover:bg-stone-200/50 transition-all duration-250 ease-in-out"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-base text-gray-500">
                  Click to <span className="font-semibold">upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">SVG, PNG, JPG, HEIC or GIF</p>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                multiple
                id="dropzone-file"
              />
            </label>
          </div>
          <div className="flex justify-center text-xs md:text-sm font-light text-gray-400 mx-8">
            Uploading your photos here only gives us, Tonio and Carla, access.
          </div>
        </div>

        {isUploading && (
          <div className="mb-8">
            <div className="w-full bg-muted-foreground rounded-full h-2.5 mb-4">
              <div className="bg-cyan-200/60 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-sidebar-foreground/30">{uploadProgress.toFixed(2)}% uploaded</p>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="bg-gray-100 rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl tracking-tight text-sidebar-foreground/70">Uploaded Files</h2>
            </div>
            <ul className="space-y-4">
              {files.map((file) => (
                <File key={file.Key} file={file} updateFiles={fetchFiles} userId={userId} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
