"use client";
import { ScrollArea } from "./scroll-area";
import { BotIcon, UserCircleIcon } from "lucide-react";
import useChatStore from "@/hooks/chatStore";
import ReactMarkdown from "react-markdown";
const ChatBox = () => {
  const { chatMsgs, isEditing } = useChatStore();

  return (
    <ScrollArea className="w-full px-3">
      <div className="flex flex-col my-5">
        {chatMsgs.map((item, index) => (
          <div
            className="flex flex-col border-l-2 border-dashed pl-4"
            key={index}>
            {/* User Message (Right) */}
            {item.role === "user" && (
              <div className="flex justify-end mb-4 items-center space-x-3">
                <UserCircleIcon
                  size={24}
                  className="w-6 h-6 flex-shrink-0 text-blue-400"
                />
                <ScrollArea className="max-w-full">
                  <div className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white">
                    <p>{item.content}</p>
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Bot Message (Left) */}
            {item.role === "ai" && (
              <div className="flex justify-start items-center mb-4">
                <BotIcon
                  size={24}
                  className="w-6 h-6 flex-shrink-0 text-gray-600"
                />
                <div className="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white">
                  <ScrollArea>
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        ))}
        {/* Show loading indicator if AI is still responding */}
      </div>
    </ScrollArea>
  );
};

export default ChatBox;
