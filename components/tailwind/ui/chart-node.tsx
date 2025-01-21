import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import GenerateChart from "./generate-chart";

export const ChartNode = Node.create({
  name: "chart",
  group: "block",
  atom: true,
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      chartData: {
        default: JSON.stringify({
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
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='chart']" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["chart", mergeAttributes(HTMLAttributes, { "data-type": "chart" })];
  },
  addNodeView() {
    // Use 'typeof GenerateChart' to indicate you're using the value, not a type
    return ReactNodeViewRenderer(({ node }) => {
      return <GenerateChart chartData={node.attrs.chartData} />;
    });
  },
});
