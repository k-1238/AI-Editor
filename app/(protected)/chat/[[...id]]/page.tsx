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
import { FaPlus, FaRegStar } from "react-icons/fa";
import Search from "@/components/tailwind/ui/animate-search/search";
import { Sparkles, LucideLoader } from "lucide-react";
import { PlusIcon } from "@radix-ui/react-icons";
import { useSessionUUID } from "@/app/providers";

export default function Page() {
  const [open, setOpen] = useState(false);
  const {
    resetChats,
    chatStarted,
    setChatStarted,
    clearChatMsgs,
    chatMsgs,
    editorInstance,
  } = useChatStore();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isOpenChatBox, setIsOpenChatBox] = useState(false);
  const { setSessionId } = useSessionUUID();
  useEffect(() => {
    console.log("useEffect");
    if (chatStarted) {
      console.log("started: ", chatStarted);
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1500); // Show skeleton for 500ms
      return () => clearTimeout(timer);
    }
  }, [chatStarted]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpenChatBox(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on component mount to handle initial load

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const makeNewChat = () => {
    setChatStarted(false);
    setSessionId();
    clearChatMsgs();
    setShowSkeleton(true);
    if (editorInstance) {
      if (editorInstance.getText() !== "") {
        editorInstance.commands.clearContent();
      }
    }
    setChatStarted(!chatStarted);
  };
  return (
    <div className="flex flex-row h-screen py-5 px-14">
      {/* Sidebar Component */}
      {/* <div
        className={`transition-all duration-300 ${chatStarted ? "sm:-ml-[323px]" : "ml-0"
          }`}>
        <Sidebar />
      </div>

      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          <Sidebar open={open} />
        </SheetContent>
      </Sheet> */}
      {chatStarted && (
        <>
          <div className="hidden lg:flex w-1/5 ml-auto overflow-auto light  dark:border-r-2">
            {showSkeleton ? (
              <div className="w-full p-4">
                <CanvasLoading />
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex flex-row px-5 mt-3 items-center space-x-2 mb-2">
                  <Sparkles className="h-15 w-15 text-[#9f00d9]" size={40} />
                  {/* <div
                    className="flex items-center cursor-pointer ml-4 w-full rounded-md justify-start px-2 py-3 border-2"
                    onClick={makeNewChat}>
                    <FaPlus /> <span className="ml-2">New Chat</span>
                  </div> */}
                  <div
                    className="flex items-center cursor-pointer ml-4 w-full rounded-md justify-start px-2 py-3"
                    onClick={makeNewChat}>
                    <div className="relative z-10 flex w-full cursor-pointer items-center overflow-hidden rounded-md border p-[1.5px]">
                      <div className="animate-rotate absolute inset-0 rounded-md bg-[conic-gradient(#60a6fb_20deg,transparent_120deg)]"></div>
                      <div className="relative z-20 flex w-full rounded-[0.60rem] justify-start items-center p-2">
                        <FaPlus />
                        <div className="flex items-center ml-2 flex-grow justify-center">
                          <span>New Chat</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center cursor-pointer rounded-md p-3 border-2"
                    onClick={() => {
                      setChatStarted(!chatStarted), setShowSkeleton(false);
                    }}>
                    <PanelRight className={`cursor-pointer`} />
                  </div>
                </div>
                <ChatBox />
                <ProposeChat className="mt-auto mb-40 px-2" />
              </div>
            )}
          </div>
          {/*Show the ChatBox in Mobile View */}
          <Sheet
            open={isOpenChatBox}
            onOpenChange={() => setIsOpenChatBox(false)}>
            <SheetContent side={"bottom"} className="h-[90vh] overflow-auto">
              <ChatBox />
              <ProposeChat className="mt-auto mb-7 px-2" />
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
      {/* Main Content */}
      <div
        className={`flex transition-all duration-700 flex-col flex-1 items-center gap-4 py-4 sm:px-5 ${
          chatStarted ? "lg:w-3/5" : "lg:w-full"
        }`}>
        <div className={`flex w-full items-center gap-2 px-4`}>
          <PanelRight
            className={`${
              (chatStarted && chatMsgs.length > 0) ||
              (!chatStarted && chatMsgs.length === 0)
                ? "sm:hidden"
                : "block"
            } cursor-pointer`}
            onClick={() => {
              if (chatMsgs.length > 0) setChatStarted(true);
              setShowSkeleton(true);
            }} // Toggle Sidebar visibility on click
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
          className={`w-full py-5 flex flex-col ${
            chatStarted && "justify-between"
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
            className={`flex flex-1 mt-5 bg-[#f3f6fb] shadow-md ${
              chatStarted ? "h-[85vh]" : "h-[64vh]"
            }`}>
            <TailwindAdvancedEditor />
          </div>
        </div>
      </div>
    </div>
  );
}
