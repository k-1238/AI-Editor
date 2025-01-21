"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { Separator } from "./ui/separator";

import { handleImageDrop, handleImagePaste } from "novel/plugins";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { slashCommand } from "./slash-command";
import { ChartNode } from "./ui/chart-node";
import { NodeView } from "@tiptap/core";

const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand, ChartNode];

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

const TailwindAdvancedEditor = () => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    null
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();

  const [openAI, setOpenAI] = useState(false);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();
      setCharsCount(editor.storage.characterCount.words());
      window.localStorage.setItem(
        "html-content",
        highlightCodeblocks(editor.getHTML())
      );
      window.localStorage.setItem("novel-content", JSON.stringify(json));
      window.localStorage.setItem(
        "markdown",
        editor.storage.markdown.getMarkdown()
      );
      setSaveStatus("Saved");
    },
    500
  );

  useEffect(() => {
    const content = window.localStorage.getItem("novel-content");
    if (content) setInitialContent(JSON.parse(content));
    else setInitialContent(defaultEditorContent);
  }, []);

  const editorRef = useRef<EditorInstance | null>(null);

  // Function to replace selected text with new text
  const replaceSelectedText = (newText: string) => {
    console.log("nexText: ", newText);

    console.log("current: ", editorRef.current);
    if (editorRef.current) {
      const { state } = editorRef.current;
      const { from, to } = state.selection;
      console.log("position: ", from, to, state);
      if (from !== to) {
        // Replace selected text with the new text
        editorRef.current.commands.insertContent(newText);
      }
    }
  };

  return (
    <div className="relative w-full max-w-screen-lg">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-3">
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
      </div>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[700px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose max-h-[57vh] overflow-auto prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}>
          {/* Generative Chart */}
          {/* <GenerateChart chartData={chartData} /> */}
          {/* Generative Menu for open AI model */}
          <GenerativeMenuSwitch
            open={openAI}
            onOpenChange={setOpenAI}
            setChartData={setChartData}>
            <Separator orientation="vertical" />
          </GenerativeMenuSwitch>
          <button
            onClick={() => {
              replaceSelectedText("New Text from AI");
              setSaveStatus("Unsaved");
            }}>
            Replace Text
          </button>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
