"use client";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import Menu from "@/components/tailwind/ui/menu";
import Sidebar from "@/components/tailwind/ui/sidebar";
import { LogOut } from "lucide-react";
import { PanelRight } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/tailwind/ui/sheet";
import { logout } from "@/actions/logout";
import { Button } from "@/components/tailwind/ui/button";
import { Tooltip } from "@/components/tailwind/ui/tooltip";

export default function Page() {
  const [open, setOpen] = useState(false);
  return (
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
          <Tooltip content="Logout" className="text-sm">
            <Button
              className="ml-auto"
              variant={"ghost"}
              onClick={() => logout()}>
              <LogOut>LogOut</LogOut>
            </Button>
          </Tooltip>
          <Menu />
        </div>

        <TailwindAdvancedEditor />
      </div>
    </div>
  );
}
