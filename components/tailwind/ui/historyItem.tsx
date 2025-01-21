"use client";
import { useCallback } from "react";
import { ScrollArea } from "./scroll-area";
import { BotIcon, UserCircleIcon } from "lucide-react";
import useChatStore from "@/hooks/chatStore";
const HistoryItem = () => {
  const parseTitleFromQuestion = useCallback((htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const markElement = doc.querySelector("mark");
    return markElement ? markElement.textContent : null;
  }, []);
  const { chatItemHis } = useChatStore();
  return (
    <ScrollArea className="w-full pr-3">
      <div className="flex flex-col gap-y-4">
        {chatItemHis.length > 0 &&
          chatItemHis.map((item, index) => (
            <div
              className="flex flex-col mt-5 border-l-2 border-dashed pl-4"
              key={index}>
              {/* User Message on the Right */}
              <div className="flex justify-end mb-4 items-center space-x-3">
                {/* Icon with dynamic size */}
                <div className="flex flex-col space-y-2 gap-y-1 items-center">
                  <UserCircleIcon size={24} className="h-6 w-6 flex-shrink-0" />
                  <p className="text-sm">{item.type.toUpperCase()}</p>
                </div>

                <ScrollArea className="max-w-full">
                  <div
                    className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
                    dangerouslySetInnerHTML={{
                      __html: parseTitleFromQuestion(item.user_question),
                    }}
                  />
                </ScrollArea>
              </div>

              {/* Bot Message on the Left */}
              <div className="flex justify-start items-center mb-4">
                {/* Icon with dynamic size */}
                <BotIcon size={24} className="w-6 h-6 flex-shrink-0" />

                <div className="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white">
                  <ScrollArea>{item.content}</ScrollArea>
                </div>
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
};

export default HistoryItem;
