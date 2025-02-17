
import React, { useState } from "react";
import { Input } from "./input";
import { useCompletion } from "ai/react";
import { IoSend } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import useChatStore from "@/hooks/chatStore";
import CrazySpinner from "./icons/crazy-spinner";
import { useSessionUUID } from "@/app/providers";
type ProposeChatProps = {
    className?: string;
}
const ProposeChat = ({ className }: ProposeChatProps) => {
    const [value, setValue] = useState<string>("");
    const [isThinking, setIsThinking] = useState(false);
    const { addMsg, updateLastAiMsg, setChatStarted, chatStarted } = useChatStore();
    const { sessionUUID } = useSessionUUID();
    const { complete } = useCompletion({
        id: uuidv4(),
        api: `${process.env.NEXT_PUBLIC_API_URL}/api/create_chat_stream`,
        onResponse: async (response) => {
            if (response.status === 429) {
                toast.error("You have reached your request limit for the day.");
                return;
            }
            if (response.status === 500) {
                toast.error("Something went wrong, Please try again later.")
                return;
            }
            const reader = response.body?.getReader();
            if (!reader) {
                toast.error("no readable stream found.");
                return;
            }
            const decoder = new TextDecoder();
            const aiMsgId = uuidv4();
            addMsg({
                id: aiMsgId,
                role: "ai",
                content: ""
            })
            setIsThinking(true);
            while (true) {
                const { value, done } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value);
                updateLastAiMsg(aiMsgId, chunk);
            }
            setIsThinking(false);
            setValue("")
        },
        onFinish: () => {
            complete("");
        },
        onError: () => { }
    })
    // chat with AI
    const proposeChat = () => {
        if (!chatStarted) {
            setChatStarted(true)
        }
        if (value === "") {
            return;
        }
        addMsg({
            id: sessionUUID,
            role: "user",
            content: value
        })
        complete(value, {
            body: {
                option: "zap",
                command: value,
                session_id: sessionUUID,
            }
        })
    }
    return (
        <div className={`relative flex items-center w-full ${className}`}>
            {isThinking ? (<div className="ml-2 mt-1">
                <CrazySpinner />
            </div>) : (
                <Input value={value} placeholder="Send a messages" type="text" onChange={(e) => setValue(e.target.value)} className="rounded-full shadow-lg" icon={<IoSend />} onIconClick={proposeChat} />
            )}

        </div>
    )
}

export default ProposeChat;