"use client";
import { RiDeleteBinLine } from "react-icons/ri";

import { HiOutlineEllipsisVertical } from "react-icons/hi2";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useCallback } from "react";
import axios from "axios";
import useChatStore, { Chat } from "@/hooks/chatStore";
type ChatItemVMenuProps = {
    session_id: string;
}
export default function ChatItemVMenu({ session_id }: ChatItemVMenuProps) {
    const {chats, setChats} = useChatStore();
    const deleteSession = useCallback(async () => {
        try {
            axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/delete_session/?session_id=${session_id}`).then(() => {
                const res = chats.filter(item => item.session_id !== session_id)
                setChats(res);
            })
        } catch (error) {
            console.log("err: ", error)
        }
    }, [setChats])
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <HiOutlineEllipsisVertical width={4} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="end">
                <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm"
                    onClick={() => {
                        deleteSession()
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <div className="rounded-sm border  p-1"><RiDeleteBinLine /></div>
                        <span>Delete</span>
                    </div>
                </Button>
            </PopoverContent>
        </Popover>
    );
}
