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

    return (
      <TooltipPrimitive.TooltipProvider>
        <TooltipPrimitive.Root {...rootProps}>
          <TooltipPrimitive.Trigger asChild>
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal
            container={container}
            forceMount={forceMount}>
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
