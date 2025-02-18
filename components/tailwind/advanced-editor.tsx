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
import { ChartExtension } from "./extensions/ChartExtension";
import { Tooltip } from "./ui/tooltip";
import { Plus, Redo2Icon, Undo2Icon } from "lucide-react";
import { useSessionUUID } from "@/app/providers";
import { Separator } from "./ui/separator";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { TextButtons } from "./selectors/text-buttons";
import { ColorSelector } from "./selectors/color-selector";
import html2canvas from "html2canvas";
import useChatStore from "@/hooks/chatStore";
import { jsPDF } from "jspdf";
import axios from "axios";

const extensions = [...defaultExtensions, ChartExtension];

const readingLevels = [
  "Basic",
  "advanced",
  "original",
  "Intermediate",
  "Professional",
  ,
  "Semi-professional",
] as const;

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
  const [readingLevel, setReadingLevel] = useState("standard");
  const { editorInstance, setEditorInstance, setChatStarted, clearChatMsgs } =
    useChatStore();
  const [loading, setLoading] = useState(false);
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
    clearChatMsgs();
    if (editorInstance) {
      if (editorInstance.getText() !== "") {
        editorInstance.commands.clearContent();
        setCharsCount(editorInstance.storage.characterCount.words());
        setSaveStatus("Unsaved");
      }
    }
  };
  const exportToPDF = async () => {
    const editorElement: any = document.querySelector(".tiptap");
    if (!editorElement) {
      console.error("Editor content element not found");
      return;
    }

    try {
      const canvas = await html2canvas(editorElement, {
        scrollY: -window.scrollY,
        height: editorElement.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save("novel-editor-export.pdf");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  useEffect(() => {
    setInitialContent(defaultEditorContent);
  }, []);

  const transformTextWithAI = async (text: string, level: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rewrite_text`,
        { text, level }
      );
      return response.data.rewritten_text;
    } catch (error) {
      console.error("OpenAI API error:", error);
      return text; // Return original if API fails
    } finally {
      setLoading(false);
    }
  };

  const applyReadingLevel = async () => {
    if (!editorInstance) return;

    const { from, to } = editorInstance.state.selection;
    const selectedText = editorInstance.state.doc.textBetween(from, to);
    const fullText = editorInstance.getText(); // Get full text
    const targetText = selectedText || fullText;

    if (!targetText) return;

    const newText = await transformTextWithAI(targetText, readingLevel);

    if (selectedText) {
      editorInstance.commands.setTextSelection({ from, to });
      editorInstance?.commands.insertContent(newText);
    } else {
      editorInstance.commands.setContent(newText);
    }
  };
  if (!initialContent) return null;

  return (
    <div className="relative w-full mx-auto flex items-center justify-center h-[inherit]">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-3 items-center justify-self-center break-words">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground space-x-2">
          <select
            value={readingLevel}
            onChange={(e) => {
              const selectedLevel = e.target
                .value as (typeof readingLevels)[number]; // Ensure valid type
              if (readingLevels.includes(selectedLevel) && selectedLevel) {
                setReadingLevel(selectedLevel);
              }
            }}
            className="border p-2 rounded">
            {readingLevels.map((level) => (
              <option key={level} value={level}>
                {level ? level.charAt(0).toUpperCase() + level.slice(1) : ""}
              </option>
            ))}
          </select>
          <button
            onClick={applyReadingLevel}
            className="bg-blue-400 text-white p-2 rounded"
            disabled={loading}>
            {loading ? "Processing..." : "Apply Reading Level"}
          </button>
        </div>
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
          className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground cursor-pointer"
          onClick={() => {
            exportToPDF();
          }}>
          Export
        </div>
      </div>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative h-full min-h-full novel-tiptap-editor overflow-auto scrollbar-thin flex flex-col w-full bg-background border"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class:
                "prose overflow-auto scrollbar-thin prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
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
