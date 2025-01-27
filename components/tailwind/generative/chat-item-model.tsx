import { MessageCircle, Check, LucideLoader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/tailwind/ui/dialog";
import HistoryItem from "../ui/historyItem";
import { Button } from "../ui/button";
import { Chat } from "../ui/sidebar";
import { useCallback, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import useChatStore from "@/hooks/chatStore";
import { toast } from "sonner";
type ChatItemModelProps = {
  chat: Chat;
  isActive: string;
  setIsActive: React.Dispatch<React.SetStateAction<string>>;
};
const ChatItemModel = ({ chat, isActive, setIsActive }: ChatItemModelProps) => {
  const { setChatItemHis } = useChatStore();
  const [isFetching, setIsFetching] = useState(false);
  const handleFetchChatsBySessionID = useCallback(
    async (session_id: string) => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        const session = await getSession();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/get_chats_by_session_id/`,
          { params: { session_id, user_id: session?.user?.pk } }
        );
        setChatItemHis(res.data.chats);
      } catch (error) {
        toast.error("Error fetching chats by session ID");
      } finally {
        setIsFetching(false);
      }
    },
    [isFetching, setChatItemHis]
  );
  return (
    <Dialog>
      {/* Use session_id or unique chat ID */}
      <DialogTrigger asChild>
        <Button
          className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm"
          variant={isActive === chat.session_id ? "secondary" : "ghost"}
          onClick={() => {
            setIsActive(chat.session_id);
            handleFetchChatsBySessionID(chat.session_id);
          }}>
          <div className="flex items-center space-x-2">
            <div className="rounded-sm border p-1">
              <MessageCircle className="h-4 w-4" />
            </div>
            <span>{chat.content && chat.content.slice(0, 20)}...</span>
          </div>
          {isActive === chat.session_id && <Check className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-w-3xl items-center flex-col h-[calc(70vh-24px)]">
        <DialogTitle>This is a Chat History</DialogTitle>
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
