"use client";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import Menu from "@/components/tailwind/ui/menu";
import Sidebar from "@/components/tailwind/ui/sidebar";
import { LogOut } from "lucide-react";
import Link from "next/link";
import Providers from "../../../providers";
import { PanelRight } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/tailwind/ui/sheet";

export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <Providers>
      <div className="flex flex-row">
        {/* Sidebar Component */}
        <Sidebar />
        <Sheet open={open} onOpenChange={() => setOpen(false)}>
          <SheetContent>
            <Sidebar open={open} />
          </SheetContent>
        </Sheet>
        <div className="flex min-h-screen w-full flex-col items-center gap-4 py-4 sm:px-5">
          <div className="flex w-full items-center gap-2 px-4 sm:mb-[calc(15vh)]">
            <PanelRight
              className="sm:hidden cursor-pointer"
              onClick={() => setOpen(!open)} // Toggle Sidebar visibility on click
            />
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
