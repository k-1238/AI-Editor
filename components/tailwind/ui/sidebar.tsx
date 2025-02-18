import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Sparkles, LucideLoader } from "lucide-react";
import Search from "./animate-search/search";
import axios from "axios";
import useChatStore from "@/hooks/chatStore";
import { getSession } from "next-auth/react";
import ChatItemModel from "../generative/chat-item-model";
import { toast } from "sonner";
import ProposeChat from "./proposeChat";
import ChatItemVMenu from "./chat-item-v-menu";

export type Chat = {
  created_at: string;
  session_id: string;
  content: string;
  user_question: string;
  title: string;
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

const mockData = [
  {
    "session_id": "3e6c9003-f4f9-4906-94c8-44f88995af4b",
    "created_at": "2025-02-03T07:01:40.742390+00:00",
    "content": "What is React.js?",
    "title": "Understanding React.js Basics",
    "user_question": "what is react.js?"
  },
  {
    "session_id": "a10fda78-db10-43d6-ab11-d0756f15b26d",
    "created_at": "2025-02-10T17:13:09.903088+00:00",
    "content": "```javascript\n{\n  labels: [\"React\", \"Vue\", \"Angular\", \"Svelte\", \"Ember\"],\n  datasets: [{\n    label: \"Popularity\",\n    data: [55, 30, 10, 3, 2],\n    backgroundColor: [\n      'rgba(255, 99, 132, 0.2)',\n      'rgba(54, 162, 235, 0.2)',\n      'rgba(255, 206, 86, 0.2)',\n      'rgba(75, 192, 192, 0.2)',\n      'rgba(153, 102, 255, 0.2)'\n    ],\n    borderColor: [\n      'rgba(255, 99, 132, 1)',\n      'rgba(54, 162, 235, 1)',\n      'rgba(255, 206, 86, 1)',\n      'rgba(75, 192, 192, 1)',\n      'rgba(153, 102, 255, 1)'\n    ],\n    borderWidth: 1\n  }]\n}\n```",
    "title": "JavaScript Framework Popularity Chart",
    "user_question": "The best frontend frameworks in web development"
  },
  {
    "session_id": "be9f4a2e-69d3-44ad-9545-34628c483ee3",
    "created_at": "2025-02-10T02:51:32.132650+00:00",
    "content": "What is React.js? \n\nReact.js is a popular JavaScript library developed by Facebook for building user interfaces, particularly for single-page applications. It allows developers to create reusable UI components, enabling efficient updates and rendering of the user interface as data changes. By utilizing a virtual DOM, React.js enhances performance and provides a seamless user experience. Its component-based architecture promotes better organization of code and facilitates collaboration among developers. Overall, React.js has become a fundamental tool in modern web development, empowering developers to create dynamic and interactive web applications.",
    "title": "Understanding React.js Basics",
    "user_question": "What is React.js?"
  },
  {
    "session_id": "ce94294b-f2f6-485f-9f58-8356a22ce1a4",
    "created_at": "2025-02-03T06:59:39.469589+00:00",
    "content": "What is React.js?",
    "title": "Understanding React.js Basics",
    "user_question": "what is Reac.js?"
  },
  {
    "session_id": "e6053554-6aca-45f0-9328-98a97b409e35",
    "created_at": "2025-02-10T16:57:46.198461+00:00",
    "content": "```javascript\n{\n  labels: [\"React\", \"Vue\", \"Angular\", \"Svelte\", \"Ember\"],\n  datasets: [{\n    label: \"Popularity\",\n    data: [60, 35, 25, 15, 10],\n    backgroundColor: [\n      'rgba(75, 192, 192, 0.2)',\n      'rgba(153, 102, 255, 0.2)',\n      'rgba(255, 159, 64, 0.2)',\n      'rgba(255, 99, 132, 0.2)',\n      'rgba(54, 162, 235, 0.2)'\n    ],\n    borderColor: [\n      'rgba(75, 192, 192, 1)',\n      'rgba(153, 102, 255, 1)',\n      'rgba(255, 159, 64, 1)',\n      'rgba(255, 99, 132, 1)',\n      'rgba(54, 162, 235, 1)'\n    ],\n    borderWidth: 1\n  }]\n}\n```",
    "title": "JavaScript Framework Popularity Chart",
    "user_question": "The best frontend frameworks in web development"
  },
  {
    "session_id": "fd1cd2ae-8472-4686-b93a-bf82fa438f9c",
    "created_at": "2025-02-10T15:28:31.736204+00:00",
    "content": "```javascript\n{\n  labels: [\"React\", \"Vue.js\", \"Angular\", \"Svelte\", \"Ember.js\"],\n  datasets: [{\n    label: \"Popularity\",\n    data: [40, 30, 20, 5, 5],\n    backgroundColor: [\n      'rgba(75, 192, 192, 0.6)',\n      'rgba(255, 206, 86, 0.6)',\n      'rgba(255, 99, 132, 0.6)',\n      'rgba(54, 162, 235, 0.6)',\n      'rgba(153, 102, 255, 0.6)'\n    ],\n    borderColor: [\n      'rgba(75, 192, 192, 1)',\n      'rgba(255, 206, 86, 1)',\n      'rgba(255, 99, 132, 1)',\n      'rgba(54, 162, 235, 1)',\n      'rgba(153, 102, 255, 1)'\n    ],\n    borderWidth: 1\n  }]\n}\n```",
    "title": "JavaScript Frameworks Popularity Chart",
    "user_question": "The best frontend frameworks in web development"
  }
]
export default function Sidebar({ open }: SidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>("");
  const observerRef = useRef<HTMLDivElement>(null);
  const [hasNext, setHasNext] = useState(false);
  const { chats, setChats, searchStream, chatStarted } = useChatStore();
  const [isActive, setIsActive] = useState<string>("");
  const handlePaginate = useCallback(async () => {
    // if (isLoading) return; // Prevent fetching if loading or cursor is null
    // setIsLoading(true);
    // const session = await getSession();
    // try {
    //   const res = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/get_first_chats/`,
    //     {
    //       params: {
    //         cursor,
    //         user_id: (session?.user as Record<string, any>)?.user_id,
    //       },
    //     }
    //   );
    //   const { next_cursor, has_next, chats } = res.data;
    //   // Append new chats
    //   if (chats.length === 0 && !next_cursor) {
    //     setHasNext(false);
    //     setIsLoading(false);
    //     setCursor(next_cursor);
    //   } else {
    //     setChats(res.data.chats);
    //     setCursor(next_cursor);
    //     setHasNext(has_next);
    //   }
    // } catch (error) {
    //   setHasNext(false);
    //   setIsLoading(false);
    //   setCursor(null);
    //   toast.error("Error fetching chats");
    // } finally {
    //   setIsLoading(false);
    // }
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
  return (
    <div
      className={`h-full ${!open && "max-sm:!w-0 border-r-2"
        }  overflow-x-hidden flex flex-col`}>
      <div className="flex flex-row py-5 px-2">
        <Sparkles className="h-15 w-15 text-[#9f00d9]" size={40} />
        <div className="flex ml-4 w-full">
          <Search />
        </div>
      </div>
      <div className="w-full h-[78vh] flex-grow overflow-y-auto space-y-2 mx-1">
        {mockData.length > 0 &&
          mockData.map((chat: Chat, index: number) => (
            <div className="flex flex-row justify-between" key={chat.session_id}>
              <ChatItemModel
                key={index}
                chat={chat}
                setIsActive={setIsActive}
                isActive={isActive}
              />
              <ChatItemVMenu session_id={chat.session_id}/>
            </div>
          ))}

        {isLoading && (
          <div className="w-full flex justify-center items-center">
            <LucideLoader
              size={30}
              className="animate-spin text-black dark:text-cyan-500"
            />
          </div>
        )}
        {!hasNext && !isLoading && (
          <div className="w-full flex justify-center items-center">
            <p className="text-gray-500">No chats available</p>
          </div>
        )}
        {hasNext && <div ref={observerRef} />}
      </div>
      <div className="flex items-center justify-center py-4 px-2">
        {!chatStarted && <ProposeChat />}
      </div>
    </div>
  );
}
