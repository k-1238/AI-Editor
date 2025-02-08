import { Skeleton } from "../tailwind/ui/skeleton";

export function CanvasLoading() {
  return (
    <>
      <div className="flex flex-col items-center w-full h-screen">
        <div className="flex flex-row gap-2 items-center mt-2 ml-auto">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-[300px] h-7 rounded-md" />
        </div>
        <div className="flex flex-col w-full space-y-5 justify-start mb-3 mr-auto mt-11">
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
          <Skeleton className="w-[70%] h-6 rounded-md" />
        </div>
      </div>
    </>
  );
}
