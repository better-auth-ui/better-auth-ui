import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import {
  Content,
  List,
  Root,
  type TabsContentProps as TabsContentPrimitiveProps,
  type TabsListProps as TabsListPrimitiveProps,
  type TabsRootProps,
  type TabsTriggerProps as TabsTriggerPrimitiveProps,
  Trigger
} from "@kobalte/core/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import {
  type ComponentProps,
  mergeProps,
  splitProps,
  type ValidComponent
} from "solid-js"

import { cn } from "@/lib/utils"

type TabsProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  TabsRootProps<T>
> &
  Pick<ComponentProps<T>, "class" | "children">

const Tabs = <T extends ValidComponent = "div">(props: TabsProps<T>) => {
  const mergedProps = mergeProps({ orientation: "horizontal" }, props)
  const [local, others] = splitProps(mergedProps, ["class", "orientation"])

  return (
    <Root
      class={cn(
        "group/tabs z-tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        local.class
      )}
      data-orientation={local.orientation}
      data-slot="tabs"
      orientation={local.orientation}
      {...others}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list z-tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-8 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "z-tabs-list-variant-default bg-muted",
        line: "z-tabs-list-variant-line gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

type TabsListProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  TabsListPrimitiveProps<T>
> &
  VariantProps<typeof tabsListVariants> &
  Pick<ComponentProps<T>, "class" | "children">

const TabsList = <T extends ValidComponent = "div">(
  props: TabsListProps<T>
) => {
  const [local, others] = splitProps(props as TabsListProps, [
    "variant",
    "class"
  ])

  return (
    <List
      class={cn(tabsListVariants({ variant: local.variant }), local.class)}
      data-slot="tabs-list"
      data-variant={local.variant}
      {...others}
    />
  )
}

type TabsTriggerProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  TabsTriggerPrimitiveProps<T>
> &
  Pick<ComponentProps<T>, "class" | "children">

const TabsTrigger = <T extends ValidComponent = "button">(
  props: TabsTriggerProps<T>
) => {
  const [local, others] = splitProps(props as TabsTriggerProps, ["class"])

  return (
    <Trigger
      class={cn(
        "relative z-tabs-trigger inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-[selected]:shadow-sm group-data-[variant=line]/tabs-list:data-[selected]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[selected]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[selected]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[selected]:bg-transparent",
        "data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm dark:data-[selected]:border-input dark:data-[selected]:bg-input/30 dark:data-[selected]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[selected]:after:opacity-100",
        local.class
      )}
      data-slot="tabs-trigger"
      {...others}
    />
  )
}

type TabsContentProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  TabsContentPrimitiveProps<T>
> &
  Pick<ComponentProps<T>, "class" | "children">

const TabsContent = <T extends ValidComponent = "div">(
  props: TabsContentProps<T>
) => {
  const [local, others] = splitProps(props as TabsContentProps, ["class"])

  return (
    <Content
      class={cn("z-tabs-content flex-1 outline-none", local.class)}
      data-slot="tabs-content"
      {...others}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants }
