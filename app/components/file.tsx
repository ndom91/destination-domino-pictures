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
      className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-stone-200/80 rounded-lg"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-stretch sm:max-h-24 p-4 sm:p-0">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Image Preview"
            className="rounded-md sm:rounded-r-none aspect-video w-38 sm:w-32 object-cover"
          />
        )}
        <span className="text-sidebar-foreground/50 truncate flex-1 text-balance break-all inline-block align-middle sm:flex sm:items-center pt-4 sm:pl-4 sm:py-0">
          {file.Key?.replace(`${userId}/`, "")}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:p-4 sm:pl-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => file.Key && handleDownload(file.Key)}
              variant="outline"
              size={isMobile ? "lg" : "icon"}
              title="Download"
            >
              <DownloadIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent hidden={isMobile}>Download File</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => file.Key && handleDelete(file.Key)}
              variant="outline"
              size={isMobile ? "lg" : "icon"}
              title="Delete"
            >
              <TrashIcon className="fill-red-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent hidden={isMobile}>Delete File</TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
}
