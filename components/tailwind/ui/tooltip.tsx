"use client";
import * as React from "react";
import classNames from "classnames";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipElement = React.ElementRef<typeof TooltipPrimitive.Content>;

interface TooltipProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  content: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
  className?: string;
}

const Tooltip = React.forwardRef<TooltipElement, TooltipProps>(
  (props, forwardedRef) => {
    const {
      children,
      className,
      open,
      defaultOpen,
      onOpenChange,
      delayDuration,
      disableHoverableContent,
      content,
      container = "", // Default to document.body if not provided
      forceMount = false,
      ...tooltipContentProps
    } = props;

    const rootProps = {
      open,
      defaultOpen,
      onOpenChange,
      delayDuration,
      disableHoverableContent,
    };

    // Client-side only logic
    const isClient = typeof window !== "undefined";
    const resolvedContainer = isClient
      ? container instanceof Element
        ? container // If container is already an Element, use it directly
        : typeof container === "string" && container.trim() !== ""
        ? document.querySelector(container) // Otherwise, treat container as a string and query for the element
        : document.body // Default to document.body if container is invalid
      : null; // No DOM access on SSR

    return (
      <TooltipPrimitive.TooltipProvider>
        <TooltipPrimitive.Root {...rootProps}>
          <TooltipPrimitive.Trigger asChild>
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal
            container={resolvedContainer} // Pass the resolved container safely
            forceMount={forceMount === true ? true : undefined}>
            <TooltipPrimitive.Content
              sideOffset={4}
              collisionPadding={10}
              {...tooltipContentProps}
              ref={forwardedRef}
              className={classNames(
                "rt-TooltipContent bg-gray-900 text-white p-2 rounded-md shadow-md",
                className
              )}>
              {content}
              <TooltipPrimitive.Arrow className="rt-TooltipArrow fill-gray-900" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.TooltipProvider>
    );
  }
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
export type { TooltipProps };
