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
	const [userId, setUserId] = useLocalStorage("userId", null, () =>
		crypto.randomUUID(),
	);

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

		setIsUploading(true);
		setUploadProgress(0);
		abortControllerRef.current = new AbortController();

		try {
			const signedUrl = await getSignedUrlForUpload(
				`${userId}/${file.name}`,
				file.type,
			);

			await uploadFileWithProgress(
				file,
				signedUrl,
				abortControllerRef.current.signal,
			);

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

	const uploadFileWithProgress = (
		file: File,
		signedUrl: string,
		signal: AbortSignal,
	): Promise<void> => {
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
		<div className="file-manager relative flex flex-1 flex-col gap-4 p-4 sm:p-12">
			<div className="ribbon ribbon-top-left">
				<span className="">
					<div className="seal">
						<div className="embossed">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								style={{ fill: "var(--seal-color)" }}
								viewBox="0 0 256 256"
							>
								<title>Camera Icon</title>
								<path
									filter="url(#Bevel)"
									d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"
								/>
								<filter
									id="Bevel"
									filterUnits="objectBoundingBox"
									x="-10%"
									y="-10%"
									width="150%"
									height="150%"
								>
									<feGaussianBlur
										in="SourceAlpha"
										stdDeviation="3"
										result="blur"
									/>
									<feSpecularLighting
										in="blur"
										surfaceScale="5"
										specularConstant="0.5"
										specularExponent="10"
										result="specOut"
										lighting-color="white"
									>
										<fePointLight x="-5000" y="-10000" z="20000" />
									</feSpecularLighting>
									<feComposite
										in="specOut"
										in2="SourceAlpha"
										operator="in"
										result="specOut2"
									/>
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
								<filter
									id="Bevel2"
									filterUnits="objectBoundingBox"
									x="-10%"
									y="-10%"
									width="150%"
									height="150%"
								>
									<feGaussianBlur
										in="SourceAlpha"
										stdDeviation="0.5"
										result="blur"
									/>
									<feSpecularLighting
										in="blur"
										surfaceScale="5"
										specularConstant="0.5"
										specularExponent="10"
										result="specOut"
										lighting-color="white"
									>
										<fePointLight x="-5000" y="-10000" z="0000" />
									</feSpecularLighting>
									<feComposite
										in="specOut"
										in2="SourceAlpha"
										operator="in"
										result="specOut2"
									/>
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
					className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-all duration-250 ease-in-out"
				>
					<div className="flex flex-col items-center justify-center pt-5 pb-6">
						<svg
							className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
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
						<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
							<span className="font-semibold">Click to upload</span> or drag and
							drop
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							SVG, PNG, JPG or GIF
						</p>
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

			{isUploading && (
				<div className="mb-8">
					<div className="w-full bg-muted-foreground rounded-full h-2.5 mb-4">
						<div
							className="bg-cyan-200/60 h-2.5 rounded-full"
							style={{ width: `${uploadProgress}%` }}
						/>
					</div>
					<div className="flex items-center justify-between">
						<p className="text-sm text-sidebar-foreground/30">
							{uploadProgress.toFixed(2)}% uploaded
						</p>
					</div>
				</div>
			)}

			{files.length > 0 && (
				<div className="bg-gray-50 rounded-lg p-4">
					<h2 className="text-xl mb-4 text-sidebar-foreground">Files</h2>
					<ul className="space-y-4">
						{files.map((file) => (
							<File
								key={file.Key}
								file={file}
								updateFiles={fetchFiles}
								userId={userId}
							/>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
