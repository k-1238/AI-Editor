import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import Menu from "@/components/tailwind/ui/menu";
import Sidebar from "@/components/tailwind/ui/sidebar";
import { LogOut } from "lucide-react";
import Link from "next/link";
import Providers from "../../../providers";

export default function Page() {
  return (
    <Providers>
      <div className="flex flex-row">
        <Sidebar />
        <div className="flex min-h-screen w-full flex-col items-center gap-4 py-4 sm:px-5">
          <div className="flex w-full items-center gap-2 px-4 sm:mb-[calc(15vh)]">
            <Link className="ml-auto" href={"/logout"}>
              <LogOut>LogOut</LogOut>
            </Link>
            <Menu />
          </div>

          <TailwindAdvancedEditor />
        </div>
      </div>
    </Providers>
  );
}
