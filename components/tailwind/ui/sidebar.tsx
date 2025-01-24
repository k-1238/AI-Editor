import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MessageCircle,
  Sparkles,
  Check,
  Plus,
  FlipVerticalIcon,
  LucideLoader,
} from "lucide-react";
import Search from "./animate-search/search";
import { Button } from "./button";
import axios from "axios";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog";
import HistoryItem from "./historyItem";
import useChatStore from "@/hooks/chatStore";
import { getSession } from "next-auth/react";

type Chat = {
  created_at: string;
  session_id: string;
  content: string;
  user_question: string;
};

export type HistoryType = {
  content: string;
  created_at: string;
  id: number;
  model: string;
  response_id: string;
  session_id: string;
  total_tokens: string;
  type: string;
  user_question: string;
};

type SidebarProps = {
  open?: boolean;
};

export default function Sidebar({ open }: SidebarProps) {
  const [isActive, setIsActive] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>("");
  const observerRef = useRef<HTMLDivElement>(null);
  const [hasNext, setHasNext] = useState(false);
  const { chats, setChats, searchStream, setChatItemHis } = useChatStore();

  const handlePaginate = useCallback(async () => {
    if (isLoading) return; // Prevent fetching if loading or cursor is null
    setIsLoading(true);
    try {
      const session = await getSession();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/get_first_chats/`,
        {
          params: { cursor, user_id: session?.user?.pk },
        }
      );
      const { next_cursor, has_next, chats } = res.data;

      // Append new chats
      if (chats.length === 0 && !next_cursor) {
        setHasNext(false);
        setIsLoading(false);
        setCursor(next_cursor);
      } else {
        setChats(res.data.chats);
        setCursor(next_cursor);
        setHasNext(has_next);
      }
    } catch (error) {
      setHasNext(false);
      setIsLoading(false);
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setChats, setCursor, isLoading, setHasNext]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading && hasNext) {
        handlePaginate();
      }
    },
    [handlePaginate, cursor, isLoading, hasNext]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    });

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [handleObserver, isLoading]);

  useEffect(() => {
    if (cursor !== null && cursor === "") {
      handlePaginate();
    }
  }, [cursor, handlePaginate]);

  const getFilteredChats = useMemo(() => {
    if (searchStream === "") {
      return chats;
    }
    return chats.filter((item) =>
      item.user_question.toLowerCase().includes(searchStream.toLowerCase())
    );
  }, [chats, searchStream]);

  const handleFetchChatsBySessionID = useCallback(
    async (session_id: string) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/get_chats_by_session_id/`,
          { params: { session_id } }
        );
        setChatItemHis(res.data.chats);
      } catch (error) {
        console.error("Error fetching chats by session ID:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, setChatItemHis]
  );
  return (
    <div
      className={`h-screen sm:min-w-[289px] ${
        !open && "max-sm:!w-0 border-r-2"
      }  overflow-x-hidden flex flex-col`}>
      <div className="flex flex-row items-center justify-between px-5 py-7">
        <Sparkles className="h-15 w-15" size={40} />
        <div className="flex justify-start ml-2">
          <Search />
        </div>
        <div className="flex flex-row space-x-2">
          <Plus size={20} />
          <FlipVerticalIcon size={20} />
        </div>
      </div>
      <div className="w-full overflow-y-auto space-y-2 h-screen">
        {getFilteredChats.length > 0 &&
          getFilteredChats.map((chat: Chat, index: number) => (
            <Dialog key={index}>
              {" "}
              {/* Use session_id or unique chat ID */}
              <DialogTrigger asChild>
                <Button
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm"
                  variant={isActive === index ? "secondary" : "ghost"}
                  onClick={() => {
                    setIsActive(index);
                    handleFetchChatsBySessionID(chat.session_id);
                  }}>
                  <div className="flex items-center space-x-2">
                    <div className="rounded-sm border p-1">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span>{chat.content && chat.content.slice(0, 20)}...</span>
                  </div>
                  {isActive === index && <Check className="h-4 w-4" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="flex max-w-3xl items-center flex-col h-[calc(70vh-24px)]">
                <DialogTitle>This is a Chat History</DialogTitle>
                <HistoryItem />
              </DialogContent>
            </Dialog>
          ))}

        {isLoading && (
          <div className="w-full flex justify-center items-center">
            <LucideLoader
              size={30}
              className="animate-spin text-black dark:text-cyan-500"
            />
          </div>
        )}
        {!hasNext && (
          <div className="w-full flex justify-center items-center">
            <p className="text-gray-500">No chats available</p>
          </div>
        )}
        {hasNext && <div ref={observerRef} />}
      </div>
      <div className="flex items-center justify-center border-t-2 border-b-2 px-5 py-7">
        Upgrade Version
      </div>
    </div>
  );
}
