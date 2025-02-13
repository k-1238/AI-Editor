"use client";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import Menu from "@/components/tailwind/ui/menu";
import Sidebar from "@/components/tailwind/ui/sidebar";
import { LogOut } from "lucide-react";
import { PanelRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/tailwind/ui/sheet";
import { logout } from "@/actions/logout";
import { Button } from "@/components/tailwind/ui/button";
import { Tooltip } from "@/components/tailwind/ui/tooltip";
import useChatStore from "@/hooks/chatStore";
import ChatBox from "@/components/tailwind/chatBox";
import { CanvasLoading } from "@/components/Common/CanvasLoading";
import { LuArrowUpNarrowWide } from "react-icons/lu";
import ProposeChat from "@/components/tailwind/ui/proposeChat";
import { FaRegStar } from "react-icons/fa";

export default function Page() {
  const [open, setOpen] = useState(false);
  const { resetChats, chatStarted } = useChatStore();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isOpenChatBox, setIsOpenChatBox] = useState(false);

  useEffect(() => {
    if (chatStarted) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1500); // Show skeleton for 500ms

      return () => clearTimeout(timer);
    }
  }, [chatStarted]);
  useEffect(() => {
    const handleResize = () => {
      // if (window.innerWidth >= 768) {
      //   // This assumes desktop starts at 1024px
      //   setOpen(false); // Automatically close on desktop
      // }
      if (window.innerWidth >= 1024) setIsOpenChatBox(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on component mount to handle initial load

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="flex flex-row h-screen">
      {/* Sidebar Component */}
      <div
        className={`transition-all duration-300 ${chatStarted ? "sm:-ml-[289px]" : "ml-0"
          }`}>
        <Sidebar />
      </div>

      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          <Sidebar open={open} />
        </SheetContent>
      </Sheet>
      {/* Main Content */}
      <div
        className={`flex transition-all duration-700 flex-col flex-1 items-center gap-4 py-4 sm:px-5 ${chatStarted ? "lg:w-3/5" : "lg:w-full"
          }`}>
        <div className={`flex w-full items-center gap-2 px-4`}>
          <PanelRight
            className={`${!chatStarted && "sm:hidden"} cursor-pointer`}
            onClick={() => { setOpen(!open) }} // Toggle Sidebar visibility on click
          />
          <Tooltip content="Logout" className="text-sm">
            <Button
              className="ml-auto"
              variant={"ghost"}
              onClick={() => {
                resetChats(), logout();
              }}>
              <LogOut>LogOut</LogOut>
            </Button>
          </Tooltip>
          <Menu />
        </div>

        <div
          className={`w-full py-5 flex flex-col ${chatStarted && "justify-between"
            }`}>
          {/* Welcome Board */}
          {!chatStarted && (
            <div className="flex flex-col items-center text-center mt-3">
              <div className="w-12 h-12 flex items-center justify-center dark:bg-gray-800 bg-cyan-300 rounded-full">
                <FaRegStar color="text-blue-400" className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold mt-4">
                Welcome To Our AI Power Editor
              </h1>
              <p className="text-blue-400 mt-2 text-lg">AI Power Editor</p>
            </div>
          )}

          {/* Editor & Chat */}
          <div
            className={`flex flex-1 mt-5 shadow-md ${chatStarted ? "h-[85vh]" : "h-[64vh]"
              }`}>
            <TailwindAdvancedEditor />
          </div>
        </div>
      </div>
      {chatStarted && (
        <>
          <div className="hidden lg:flex w-2/5 ml-auto overflow-auto h-[100vh] dark:border-l-2">
            {showSkeleton ? (
              <div className="w-full p-4">
                <CanvasLoading />
              </div>
            ) : (
              <div className="flex flex-col">
                <ChatBox />
                <ProposeChat className="mt-auto mb-3 px-2" />
              </div>
            )}
          </div>
          <Sheet
            open={isOpenChatBox}
            onOpenChange={() => setIsOpenChatBox(false)}>
            <SheetContent side={"bottom"} className="h-[90vh] overflow-auto">
              <ChatBox />
              <ProposeChat className="mt-auto mb-3 px-2" />
            </SheetContent>
          </Sheet>
          <div className="absolute bottom-3 left-1/2 lg:hidden -lg flex size-10 animate-bounce items-center justify-center rounded-full bg-white p-2 ring-1 ring-gray-900/5 dark:bg-[#9f00d9] dark:ring-white/20">
            <Tooltip content="Chat" className="text-sm">
              <LuArrowUpNarrowWide
                color="blue"
                className="cursor-pointer"
                onClick={() => setIsOpenChatBox(true)}
              />
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
}
