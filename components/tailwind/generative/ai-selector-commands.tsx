import {
  ArrowDownWideNarrow,
  CheckCheck,
  RefreshCcwDot,
  StepForward,
  WrapText,
  Command,
  BarChartBig,
} from "lucide-react";
import { useEditor } from "novel";
import { getPrevText } from "novel/utils";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";

const options = [
  {
    value: "IMPROVE",
    label: "Improve writing",
    icon: RefreshCcwDot,
  },

  {
    value: "FIX",
    label: "Fix grammar",
    icon: CheckCheck,
  },
  {
    value: "SHORTER",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "LONGER",
    label: "Make longer",
    icon: WrapText,
  },
  {
    value: "INSTRUCTION",
    label: "Instruction for Selected Text",
    icon: Command,
  },
  {
    value: "CHART",
    label: "Generate Chart",
    icon: BarChartBig,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
  setChartType: (chartType: string) => void;
}

const AISelectorCommands = ({
  onSelect,
  setChartType,
}: AISelectorCommandsProps) => {
  const { editor } = useEditor();

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              setChartType(option.value);
              const slice = editor?.state.selection.content();
              const text = editor?.storage.markdown.serializer.serialize(
                slice?.content
              );
              onSelect(text, value);
            }}
            className="flex gap-2 px-4 cursor-pointer"
            key={option.value}
            value={option.value}>
            <option.icon className="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to do more">
        <CommandItem
          onSelect={() => {
            const pos = editor?.state.selection.from;
            if (editor && pos) {
              const text = getPrevText(editor, pos);
              onSelect(text, "CONTINUE");
            }
          }}
          value="continue"
          className="gap-2 px-4 cursor-pointer">
          <StepForward className="h-4 w-4 text-purple-500" />
          Continue writing
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
