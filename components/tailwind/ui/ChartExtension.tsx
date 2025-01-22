// Filename: ChartNode.tsx
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import GenerateChart from "./generate-chart";

export const ChartExtension = Node.create({
  name: "chart",

  group: "block",

  addAttributes() {
    return {
      data: {
        default: null,
        parseHTML: (element) =>
          JSON.parse(element.getAttribute("data-chart") || "{}"),
        renderHTML: (attributes) => {
          return {
            "data-chart": JSON.stringify(attributes.data),
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-chart]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GenerateChart);
  },
});
