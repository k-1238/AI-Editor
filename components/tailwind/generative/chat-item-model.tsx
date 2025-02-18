import { MessageCircle, LucideLoader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/tailwind/ui/dialog";
import { TbMessageDots } from "react-icons/tb";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import HistoryItem from "../ui/historyItem";
import { Button } from "../ui/button";
import { Chat } from "../ui/sidebar";
import { useCallback, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import useChatStore, { HistoryType } from "@/hooks/chatStore";
import { toast } from "sonner";
type ChatItemModelProps = {
  chat: Chat;
  isActive: string;
  setIsActive: React.Dispatch<React.SetStateAction<string>>;
};
const ChatItemModel = ({ chat, isActive, setIsActive }: ChatItemModelProps) => {
  const { fetchChatItemHis } = useChatStore();
  const [isFetching, setIsFetching] = useState(false);
  const handleFetchChatsBySessionID = useCallback(
    async (session_id: string) => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        const session = await getSession();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/get_chats_by_session_id/`,
          {
            params: {
              session_id,
              user_id: (session?.user as Record<string, any>)?.user_id,
            },
          }
        );
        fetchChatItemHis(res.data.chats);
      } catch (error) {
        toast.error("Error fetching chats by session ID");
      } finally {
        setIsFetching(false);
      }
    },
    [isFetching, fetchChatItemHis]
  );
  return (
    <Dialog>
      {/* Use session_id or unique chat ID */}
      <DialogTrigger asChild>
        <Button
          className={`flex items-center space-x-2 rounded px-2 py-1.5 text-sm ${isActive === chat.session_id ? "rounded-lg border-l-2 border-blue-400" : "rounded-sm"
            }`}
          variant={isActive === chat.session_id ? "secondary" : "ghost"}
          onClick={(e) => {
            e.stopPropagation()
            setIsActive(chat.session_id);
            handleFetchChatsBySessionID(chat.session_id);
          }}>
          <div className="flex items-center space-x-2 w-full">
            <div className="rounded-sm border p-1">
              <TbMessageDots
                className="h-4 w-4" />
            </div>
            <span className="truncate w-56">
              {chat.title && chat.title.length > 25 ? chat.title.slice(0, 25) : chat.title}
              ...
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-w-3xl items-center flex-col h-[calc(70vh-24px)]">
        <DialogTitle><VisuallyHidden>This is a Chat History</VisuallyHidden></DialogTitle>
        {isFetching ? (
          <div className="w-full flex justify-center items-center h-[inherit]">
            <LucideLoader
              size={30}
              className="animate-spin text-black dark:text-cyan-500"
            />
          </div>
        ) : (
          <HistoryItem />
        )}
      </DialogContent>
    </Dialog>
  );
};
export default ChatItemModel;
