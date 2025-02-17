import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode; // Accept an icon as a prop
  onIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, onIconClick, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && onIconClick) {
        onIconClick();
      }
    }
    return (
      <>
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          onKeyDown={handleKeyDown}
          ref={ref}
          {...props}
        />
        {icon && (
          <span className="absolute right-3 text-gray-500 cursor-pointer" onClick={onIconClick}>
            {icon}
          </span>
        )}
      </>
    );
  }
);

Input.displayName = "Input";

export { Input };
