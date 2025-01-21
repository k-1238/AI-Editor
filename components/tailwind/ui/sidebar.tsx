"use client";
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

export default function Sidebar() {
  const [isActive, setIsActive] = useState<Number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const [hasNext, setHasNext] = useState(false);
  const { chats, setChats, searchStream, setChatItemHis } = useChatStore();
  const handlePaginate = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/get_first_chats/",
        { params: { cursor } }
      );
      const next_cursor = res.data.next_cursor;
      if (res.data.has_next === false) {
        setHasNext(false);
        return;
      }
      setChats(res.data.chats);
      setCursor(next_cursor);
      setHasNext(res.data.has_next);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading && hasNext) {
        handlePaginate();
      }
    },
    [handlePaginate, isLoading, hasNext] // Dependencies adjusted here
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleObserver]); // Only depend on handleObserver

  // Initial data load if cursor is null
  useEffect(() => {
    if (!cursor || cursor === "") {
      handlePaginate();
    }
  }, [cursor]);

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
        await axios
          .get("http://127.0.0.1:8000/api/get_chats_by_session_id/", {
            params: { session_id },
          })
          .then((response) => {
            setChatItemHis(response.data.chats);
          })
          .catch((error) => {
            console.error("Error fetching chats:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {}
    },
    []
  );

  return (
    <div className="h-screen w-1/5 flex flex-col border-r-2">
      <div className="flex flex-row items-center justify-between px-5 py-7">
        <Sparkles className="h-15 w-15" size={40} />
        <div className="flex-1 flex justify-start ml-2">
          <Search />
        </div>
        <div className="flex flex-row space-x-2">
          <Plus size={20} />
          <FlipVerticalIcon size={20} />
        </div>
      </div>
      <div className="w-full overflow-y-auto">
        {getFilteredChats && getFilteredChats.length > 0 ? (
          getFilteredChats.map((chat: Chat, index: number) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Button
                  key={index}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm"
                  variant={isActive === index ? "secondary" : "ghost"}
                  onClick={async () => {
                    await handleFetchChatsBySessionID(chat.session_id);
                    setIsActive(index);
                  }}>
                  <div className="flex items-center space-x-2">
                    <div className="rounded-sm border  p-1">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span>{chat.content && chat.content.slice(0, 20)} ...</span>
                  </div>
                  {isActive === index && <Check className="h-4 w-4" />}
                </Button>
              </DialogTrigger>

              <DialogContent className="flex max-w-3xl items-center flex-col h-[calc(70vh-24px)]">
                <DialogTitle className="">This is a Chat History</DialogTitle>
                <HistoryItem />
              </DialogContent>
            </Dialog>
          ))
        ) : isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <LucideLoader
              size={30}
              className="animate-spin text-black dark:text-cyan-500"
            />
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-500">No chats available</p>
          </div>
        )}
        <div ref={observerRef} />
      </div>
      <div className="flex items-center justify-center border-t-2 border-b-2 px-5 py-7 mt-5">
        Upgrade Version
      </div>
    </div>
  );
}
