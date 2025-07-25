import { deleteFile, getSignedUrlForDownload } from "@/app/lib/r2-actions";
import { DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { Button } from "@/components/ui/button";
import { FileObject } from "@/app/lib/r2";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function File({
  file,
  updateFiles,
  userId,
}: { file: FileObject; updateFiles: () => Promise<void>; userId: string }) {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const isMobile = useIsMobile();

  useEffect(() => {
    async function getImageUrl() {
      if (file.Key) {
        setImageUrl(await getSignedUrlForDownload(file.Key));
      }
    }
    getImageUrl();
  }, [file]);

  const handleDownload = async (key: string) => {
    try {
      const signedUrl = await getSignedUrlForDownload(key);
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error("Error downloading file", error);
      toast.error("Error downloading file");
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteFile(key);
      toast.info("File deleted successfully!");
      updateFiles();
    } catch (error) {
      console.error("Error deleting file", error);
      toast.error("Error deleting file");
    }
  };

  return (
    <li
      key={file.Key}
      className="relative flex flex-row items-start sm:items-center justify-between gap-2 bg-gray-200 rounded-lg"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-stretch sm:max-h-24 p-4 pr-2 sm:p-0">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Image Preview"
            className="rounded-md sm:rounded-r-none aspect-video w-full sm:w-32 object-cover"
          />
        )}
        <span className="text-sidebar-foreground/50 truncate flex-1 text-balance break-all inline-block tracking-tight align-middle sm:flex sm:items-center pt-4 sm:pl-4 sm:py-0">
          {file.Key?.replace(`${userId}/`, "")}
        </span>
      </div>
      <div className="flex flex-col h-full p-4 pl-0 sm:flex-row justify-between sm:justify-end gap-2 top-4 right-4 sm:relative sm:top-auto sm:right-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => file.Key && handleDownload(file.Key)}
              variant="outline"
              size={isMobile ? undefined : "icon"}
              title="Download"
              className={isMobile ? "size-18 border-0 text-gray-800" : "text-gray-800 border-0"}
            >
              <DownloadIcon className={isMobile ? "size-5" : ""} />
            </Button>
          </TooltipTrigger>
          <TooltipContent hidden={isMobile}>Download File</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => file.Key && handleDelete(file.Key)}
              variant="outline"
              size={isMobile ? undefined : "icon"}
              title="Delete"
              className={isMobile ? "size-18 border-0" : "border-0"}
            >
              <TrashIcon className={isMobile ? "size-5 fill-red-300" : "fill-red-300"} />
            </Button>
          </TooltipTrigger>
          <TooltipContent hidden={isMobile}>Delete File</TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
}
