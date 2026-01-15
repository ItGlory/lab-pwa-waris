"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: "default" | "glass" | "glass-pwa" | "underline" | "pills"
}) {
  const variantStyles = {
    default: "bg-muted p-[3px]",
    glass: "backdrop-blur-sm bg-background/80 border border-border/50 p-1 shadow-lg",
    "glass-pwa":
      "backdrop-blur-sm bg-[var(--pwa-cyan)]/5 border border-[var(--pwa-cyan)]/20 p-1 shadow-lg shadow-[var(--pwa-cyan)]/5",
    underline: "bg-transparent border-b border-border rounded-none p-0 gap-4",
    pills: "bg-transparent p-0 gap-2",
  }

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-lg",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: "default" | "gradient" | "gradient-pwa" | "underline" | "pills" | "glow"
}) {
  const variantStyles = {
    default:
      "data-[state=active]:bg-background dark:data-[state=active]:bg-input/30 data-[state=active]:shadow-sm border border-transparent dark:data-[state=active]:border-input rounded-md",
    gradient:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 border-0 rounded-md",
    "gradient-pwa":
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[var(--pwa-cyan)]/30 border-0 rounded-md hover:bg-[var(--pwa-cyan)]/10",
    underline:
      "border-0 border-b-2 border-transparent rounded-none pb-3 data-[state=active]:border-[var(--pwa-cyan)] data-[state=active]:text-[var(--pwa-cyan)]",
    pills:
      "data-[state=active]:bg-[var(--pwa-cyan)] data-[state=active]:text-white border-0 rounded-full px-4 hover:bg-muted",
    glow: "data-[state=active]:bg-[var(--pwa-cyan)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[var(--pwa-cyan)]/50 border-0 rounded-md animate-breathing-glow",
  }

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground dark:data-[state=active]:text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none mt-2 animate-in fade-in-0 duration-200",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
