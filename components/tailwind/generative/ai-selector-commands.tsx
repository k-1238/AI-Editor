import { CheckCheck, RefreshCcwDot, BarChartBig } from "lucide-react";
import { useEditor } from "novel";
import { CommandGroup, CommandItem } from "../ui/command";

const options = [
  {
    value: "IMPROVE",
    label: "Instruction for Selected Text",
    icon: RefreshCcwDot,
  },

  {
    value: "FIX",
    label: "Fix grammar",
    icon: CheckCheck,
  },
  {
    value: "CHART",
    label: "Generate Chart",
    icon: BarChartBig,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              const selectedText = editor?.state.selection.content().content.textBetween(0, editor?.state.selection.content().content.size, "\n") || "";
              onSelect(selectedText, value);
            }}
            className="flex gap-2 px-4 cursor-pointer"
            key={option.value}
            value={option.value}>
            <option.icon className="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
