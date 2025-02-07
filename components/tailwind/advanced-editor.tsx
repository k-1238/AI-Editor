import { defaultEditorContent } from "@/lib/content";
import {
  EditorContent,
  type EditorInstance,
  EditorRoot,
  JSONContent,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { ChartExtension } from "./ui/ChartExtension";
import { Tooltip } from "./ui/tooltip";
import { Plus, Redo2Icon, Undo2Icon } from "lucide-react";
import { useSessionUUID } from "@/app/providers";
import { Separator } from "./ui/separator";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { TextButtons } from "./selectors/text-buttons";
import { ColorSelector } from "./selectors/color-selector";
import { Button } from "./ui/button";
import useChatStore from "@/hooks/chatStore";

const extensions = [...defaultExtensions, ChartExtension];

const TailwindAdvancedEditor = () => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    null
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();
  const [openAI, setOpenAI] = useState(false);
  const { setSessionId } = useSessionUUID();
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const { editorInstance, setEditorInstance, setChatStarted } = useChatStore();
  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      // Extract chart data from the editor content
      setCharsCount(editor.storage.characterCount.words());
      setSaveStatus("Saved");
    },
    500
  );
  const makeNewChat = () => {
    setChatStarted(false);
    setSessionId();
    if (editorInstance) {
      if (editorInstance.getText() !== "") {
        editorInstance.commands.clearContent();
        setCharsCount(editorInstance.storage.characterCount.words());
        setSaveStatus("Unsaved");
      }
    }
  };
  // useEffect(() => {
  //   if (streamData) {
  //     if (editorInstance) {
  //       editorInstance.commands.insertContent(streamData);
  //     }
  //   }
  // }, [streamData]);
  useEffect(() => {
    setInitialContent(defaultEditorContent);
  }, []);
  if (!initialContent) return null;

  return (
    <div className="relative w-full mx-auto flex items-center justify-center h-[inherit]">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-3">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          <Tooltip content="New Chat" className="text-sm">
            <Plus
              size={20}
              className="cursor-pointer"
              onClick={() => makeNewChat()}
            />
          </Tooltip>
        </div>
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          <Tooltip content="Undo" className="text-sm">
            <Undo2Icon
              size={20}
              className="cursor-pointer"
              onClick={() => editorInstance?.commands.undo()}
            />
          </Tooltip>
        </div>
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          <Tooltip content="Redo" className="text-sm">
            <Redo2Icon
              size={20}
              className="cursor-pointer"
              onClick={() => editorInstance?.commands.redo()}
            />
          </Tooltip>
        </div>
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          {saveStatus}
        </div>
        <div
          className={
            charsCount
              ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground"
              : "hidden"
          }>
          {charsCount} Words
        </div>
        <div
          className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          Export
        </div>
      </div>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative h-full min-h-full overflow-auto flex flex-col w-full border-muted bg-background sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class:
                "prose overflow-auto prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onCreate={({ editor }) => setEditorInstance(editor)}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}>
          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
      {/* <div className="fixed bottom-4 right-4 transition-all duration-300 ease-in-out text-black flex flex-col items-center justify-center ">
        <Button>Export</Button>
      </div> */}
    </div>
  );
};

export default TailwindAdvancedEditor;
