"use client";

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
import { ChartData } from "../advanced-editor";
import { v4 as uuidv4 } from "uuid";
import useChatStore from "@/hooks/chatStore";
import axios from "axios";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setChartData: (chartData: ChartData) => void;
}

export function AISelector({ onOpenChange, setChartData }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const sessionUUID = useSessionUUID();
  const [streamedOutput, setStreamedOutput] = useState("");
  const [selectedValue = "", setSelectedValue] = useState<any>(null);
  const [selectedOption = "", setSelectedOption] = useState<any>(null);
  const { addChat, addChatHis } = useChatStore();
  const [chartType, setChartType] = useState("");
  const [collectedMsg, setCollectedMsg] = useState<string | null>(null);
  const handleSaveChat = useCallback(
    async (data: any) => {
      try {
        await axios
          .post("http://127.0.0.1:8000/api/save_chat", {
            option: data.option,
            command: data.command,
            session_id: data.session_id,
            collectedMsg: data.collectedMsg,
            prompt: data.command,
          })
          .then((res) => {
            addChat(res.data.user);
            addChatHis(res.data.chatHis);
          });
      } catch (error) {
        console.log("error: ", error);
      }
    },
    [collectedMsg]
  );

  useEffect(() => {
    if (collectedMsg && selectedValue && selectedOption && sessionUUID) {
      const data = {
        option: selectedOption,
        command: selectedValue,
        session_id: sessionUUID,
        collectedMsg: collectedMsg,
      };

      handleSaveChat(data);
    }
  }, [
    handleSaveChat,
    collectedMsg,
    sessionUUID,
    selectedValue,
    selectedOption,
  ]);

  const { completion, complete, isLoading } = useCompletion({
    id: uuidv4(),
    api: "http://127.0.0.1:8000/api/create_chat_stream",
    onResponse: async (response) => {
      setStreamedOutput("");
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }
      if (response.body.locked) {
        toast.error("Stream is already locked!");
      }
      const reader = response.body?.getReader();
      if (!reader) {
        console.error("No readable stream found.");
        return;
      }

      let output = "";
      const decoder = new TextDecoder();

      // Read chunks from the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        output += chunk;
        if (chartType !== "chart") setStreamedOutput((prev) => prev + chunk);
      }
      console.log("output: ", output);
      setCollectedMsg(output);

      if (chartType === "chart") {
        try {
          const sanitizedOutput = output
            .replace(/`/g, "")
            .replace(/javascript/g, "")
            .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
            .replace(/'([^']+)'/g, '"$1"');

          const parsedData = JSON.parse(sanitizedOutput);
          setChartData(parsedData);
        } catch (error) {
          console.error("Failed to parse streamed JavaScript response:", error);
          toast.error("Failed to process the streamed response.");
        }
      }
    },

    onFinish: () => {
      complete("");
    },

    // onError: (e) => {
    //   toast.error(e.message);
    // },
  });

  useEffect(() => {
    if (selectedOption && selectedValue !== "")
      complete(selectedValue, {
        body: {
          option: selectedOption,
          command: selectedValue,
          session_id: sessionUUID,
        },
      });
  }, [chartType]);

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

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
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
              onFocus={() => addAIHighlight(editor)}
            />
            {/* Zad */}
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={async () => {
                if (completion)
                  return complete(completion, {
                    body: {
                      option: "zap",
                      command: inputValue,
                      session_id: sessionUUID,
                    },
                  }).then(() => {
                    setInputValue("");
                  });

                const slice = editor.state.selection.content();
                const text = editor.storage.markdown.serializer.serialize(
                  slice.content
                );
                selectedValue(inputValue);
                selectedOption("zap");
                await complete(text, {
                  body: {
                    option: "zap",
                    command: inputValue,
                    session_id: sessionUUID,
                  },
                }).then(() => {
                  selectedOption("zap");
                });
              }}>
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            // fix, shorter,longer, improve, instruction,continue, chart
            <AISelectorCommands
              setChartType={setChartType}
              onSelect={async (value, option) => {
                setChartType(option);
                setSelectedOption(option);
                setSelectedValue(value);
                const data = {
                  option: option,
                  command: value,
                  session_id: sessionUUID,
                };
                await complete(value, { body: data });
              }}
            />
          )}
        </>
      )}
      {/* Displaying the streamed output progressively */}
      {streamedOutput && (
        <div className="mt-4 max-h-[30vh] overflow-auto px-2 py-1">
          <h3 className="font-bold justify-self-center">AI Response:</h3>
          <div className="prose p-2 px-4 prose-sm">
            <Markdown>{streamedOutput}</Markdown>
          </div>
        </div>
      )}
    </Command>
  );
}
