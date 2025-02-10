import { Command, CommandInput } from "@/components/tailwind/ui/command";
import { useCompletion } from "ai/react";
import { ArrowUp } from "lucide-react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel/extensions";
import { useCallback, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { useSessionUUID } from "@/app/providers";
import { v4 as uuidv4 } from "uuid";
import useChatStore from "@/hooks/chatStore";
import axios from "axios";
import { getSession } from "next-auth/react";
interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const { sessionUUID } = useSessionUUID();
  const [selectedValue, setSelectedValue] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const {
    addChat,
    setChatStarted,
    addMsg,
    updateLastAiMsg,
    isEditing,
    setIsEditing,
  } = useChatStore();
  const handleSaveChat = useCallback(async (data: any) => {
    const session = await getSession();
    try {
      await axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/api/save_chat`, {
          option: data.option, // option
          command: data.command, // selectedText
          session_id: data.session_id, // session_id
          collectedMsg: data.collectedMsg, // ai response
          prompt: data.option === "zap" ? inputValue : data.command, // zap, fix, instruction, chart
          user_id: (session?.user as Record<string, any>)?.user_id, // user_id
        })
        .then((res) => {
          addChat(res.data.user);
        });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  }, []);

  const { completion, complete, isLoading } = useCompletion({
    id: uuidv4(),
    api: `${process.env.NEXT_PUBLIC_API_URL}/api/create_chat_stream`,
    onResponse: async (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }
      if (response.status === 500) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) {
        toast.error("No readable stream found.");
        return;
      }

      let output = "";
      const aiMsgId = uuidv4();
      const decoder = new TextDecoder();
      if (selectedOption === "zap" || selectedOption === "improve") {
        addMsg({ id: aiMsgId, role: "ai", content: "" });
      }
      setIsEditing(true);
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          if (editor) {
            editor.chain().focus().unsetColor().run();
          }
          break;
        }
        const chunk = decoder.decode(value);
        output += chunk;
        if (selectedOption !== null && selectedOption !== "") {
          if (selectedOption === "zap" || selectedOption === "improve") {
            updateLastAiMsg(aiMsgId, chunk);
          } else {
            if (selectedOption !== "chart") {
              if (editor) {
                const { from, to } = editor.state.selection;
                editor.commands.setTextSelection({ from, to });
                editor
                  .chain()
                  .focus()
                  .setColor("#60a5fa")
                  .insertContent(chunk)
                  .run();
              }
            }
          }
        }
      }
      if (selectedOption !== null && selectedOption !== "") {
        if (selectedOption === "chart") {
          try {
            const sanitizedOutput = output
              .replace(/`/g, "")
              .replace(/javascript/g, "")
              .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
              .replace(/'([^']+)'/g, '"$1"');
            const parsedData = JSON.parse(sanitizedOutput);
            if (editor) {
              const { from, to } = editor.state.selection;
              editor.commands.setTextSelection({ from, to });
              editor?.commands.insertContent({
                type: "chart",
                attrs: {
                  data: parsedData,
                },
              });
            }
          } catch (error) {
            toast.error(
              "Failed to process the streamed response for Chart Generator"
            );
          }
        }
        if (output && selectedValue && selectedOption && sessionUUID) {
          const data = {
            option: selectedOption, // option
            command: selectedValue, // selectedText
            session_id: sessionUUID, // session_id
            collectedMsg: output, // ai response
          };
          // handleSaveChat(data);
        }
      }

      setIsEditing(false);
    },
    onFinish: () => {
      complete("");
    },
    onError: (e) => {},
  });

  useEffect(() => {
    if (selectedOption && selectedValue !== "" && sessionUUID) {
      if (selectedOption === "zap" || selectedOption === "improve") {
        setChatStarted(true);
        addMsg({ id: uuidv4(), role: "user", content: selectedValue });
      }
      complete(selectedValue, {
        body: {
          option: selectedOption, // option
          command: selectedValue, // selectedText
          session_id: sessionUUID, // sessionId
        },
      });
    }
  }, [selectedOption, selectedValue, sessionUUID]);

  const hasCompletion = completion.length > 0;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isEditing && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isEditing && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next"
                  : "Ask AI to edit or generate..."
              }
              onFocus={() => {
                if (editor) addAIHighlight(editor);
              }}
            />
            {/* Zap */}
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={async () => {
                const selectedText =
                  editor?.state.selection
                    .content()
                    .content.textBetween(
                      0,
                      editor?.state.selection.content().content.size,
                      "\n"
                    ) || "";
                setSelectedValue(selectedText);
                setSelectedOption("zap");
              }}>
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor?.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <>
              {/* fix, improve, chart */}
              <AISelectorCommands
                onSelect={async (selectedText, option) => {
                  setSelectedOption(option);
                  setSelectedValue(selectedText);
                }}
              />
            </>
          )}
        </>
      )}
    </Command>
  );
}
