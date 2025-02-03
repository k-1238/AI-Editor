import { defaultEditorContent } from "@/lib/content";
import {
  EditorContent,
  type EditorInstance,
  EditorRoot,
  JSONContent,
  useEditor,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { ChartExtension } from "./ui/ChartExtension";
import { Tooltip } from "./ui/tooltip";
import { Plus } from "lucide-react";
import { useSessionUUID } from "@/app/providers";

const extensions = [...defaultExtensions, ChartExtension];

const TailwindAdvancedEditor = () => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    null
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();
  const [openAI, setOpenAI] = useState(false);
  const { setSessionId } = useSessionUUID();
  const [editorInstance, setEditorInstance] = useState<EditorInstance | null>(
    null
  );
  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      // Extract chart data from the editor content
      setCharsCount(editor.storage.characterCount.words());
      setSaveStatus("Saved");
    },
    500
  );
  const makeNewChat = () => {
    setSessionId();
    if (editorInstance) {
      if (editorInstance.getText() !== "") {
        editorInstance.commands.clearContent();
        setCharsCount(editorInstance.storage.characterCount.words());
        setSaveStatus("Unsaved");
      }
    }
  };
  useEffect(() => {
    setInitialContent(defaultEditorContent);
  }, []);
  if (!initialContent) return null;

  return (
    <div className="relative w-full max-w-screen-lg mx-auto flex items-center justify-center">
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
          {saveStatus}
        </div>
        <div
          className={
            charsCount
              ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground"
              : "hidden"
          }
        >
          {charsCount} Words
        </div>
      </div>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative sm:min-h-[50vh] min-h-[80vh] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(19vh)] sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class:
                "prose sm:max-h-[50vh] max-h-[80vh] overflow-auto prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onCreate={({ editor }) => setEditorInstance(editor)}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <GenerativeMenuSwitch
            open={openAI}
            onOpenChange={setOpenAI}
          ></GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
