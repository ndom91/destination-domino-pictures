"use client"

import { toast } from "sonner"
import { DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { FileObject } from "@/app/lib/r2"
import { deleteFile, getSignedUrlForDownload, getSignedUrlForUpload, listFiles } from "@/app/lib/r2-actions"
import { Button } from "@/components/ui/button"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile";

export default function Page() {
  const [files, setFiles] = useState<FileObject[]>([])
  // const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const data = await listFiles()
      setFiles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching files:', error)
      setFiles([])
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange.e.target.file', e.target.files)
    if (e.target.files) {
      // setFile(e.target.files[0])
      await handleUpload(e.target.files[0])
    }
  }

  const handleUpload = async (file: File) => {
    console.log('handleUpload.file', file)
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    abortControllerRef.current = new AbortController()

    try {
      const signedUrl = await getSignedUrlForUpload(file.name, file.type)

      await uploadFileWithProgress(
        file,
        signedUrl,
        abortControllerRef.current.signal
      )

      toast.success('File uploaded successfully!')
      // setFile(null)
      fetchFiles()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('Upload cancelled')
      } else {
        console.error('Error uploading file:', error)
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      abortControllerRef.current = null
    }
  }

  const uploadFileWithProgress = (
    file: File,
    signedUrl: string,
    signal: AbortSignal
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', signedUrl)
      // xhr.setRequestHeader('Content-Type', file.type)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = (e) => {
        toast.error(`Error uploading file ${file.name}, please try again`)
        // reject(new Error('Upload failed'))
        reject()
      }

      xhr.send(file)

      signal.addEventListener('abort', () => {
        xhr.abort()
        // toast.error(`Error uploading file ${file.name}, please try again`)
        reject()
      })
    })
  }

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleDownload = async (key: string) => {
    try {
      const signedUrl = await getSignedUrlForDownload(key)
      window.open(signedUrl, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleDelete = async (key: string) => {
    try {
      await deleteFile(key)
      toast.info('File deleted successfully!')
      fetchFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Error deleting file')
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-12">

      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
          </div>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
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
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-sidebar-foreground/30">
              {uploadProgress.toFixed(2)}% uploaded
            </p>
            {/* <button */}
            {/*   onClick={handleCancelUpload} */}
            {/*   className="text-red-500 hover:text-red-600 transition duration-300" */}
            {/* > */}
            {/*   Cancel Upload */}
            {/* </button> */}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-sidebar-foreground">Files</h2>
      {files.length === 0 ? (
        <p className="text-sidebar-foreground/50 italic">No files found.</p>
      ) : (
        <ul className="space-y-4">
          {files.map((file) => (
            <li
              key={file.Key}
              className="flex items-center justify-between bg-muted p-4 rounded-lg"
            >
              <span className="text-sidebar-foreground/50 truncate flex-1">{file.Key}</span>
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => file.Key && handleDownload(file.Key)}
                      variant="outline"
                      size="icon"
                      title="Download"
                    >
                      <DownloadIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    hidden={isMobile}
                  >
                    Download File
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => file.Key && handleDelete(file.Key)}
                      variant="outline"
                      size="icon"
                    >
                      <TrashIcon className="fill-red-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    hidden={isMobile}
                  >
                    Delete File
                  </TooltipContent>
                </Tooltip>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}



