import { type ComponentProps, splitProps } from "solid-js"
import { cn } from "cn"

type TableProps = ComponentProps<"table">

const Table = (props: TableProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div class="z-table-container" data-slot="table-container">
      <table class={cn("z-table", local.class)} data-slot="table" {...others} />
    </div>
  )
}

type TableHeaderProps = ComponentProps<"thead">

const TableHeader = (props: TableHeaderProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <thead
      class={cn("z-table-header", local.class)}
      data-slot="table-header"
      {...others}
    />
  )
}

type TableBodyProps = ComponentProps<"tbody">

const TableBody = (props: TableBodyProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <tbody
      class={cn("z-table-body", local.class)}
      data-slot="table-body"
      {...others}
    />
  )
}

type TableFooterProps = ComponentProps<"tfoot">

const TableFooter = (props: TableFooterProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <tfoot
      class={cn("z-table-footer", local.class)}
      data-slot="table-footer"
      {...others}
    />
  )
}

type TableRowProps = ComponentProps<"tr">

const TableRow = (props: TableRowProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <tr
      class={cn("z-table-row", local.class)}
      data-slot="table-row"
      {...others}
    />
  )
}

type TableHeadProps = ComponentProps<"th">

const TableHead = (props: TableHeadProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <th
      class={cn("z-table-head", local.class)}
      data-slot="table-head"
      {...others}
    />
  )
}

type TableCellProps = ComponentProps<"td">

const TableCell = (props: TableCellProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <td
      class={cn("z-table-cell", local.class)}
      data-slot="table-cell"
      {...others}
    />
  )
}

type TableCaptionProps = ComponentProps<"caption">

const TableCaption = (props: TableCaptionProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <caption
      class={cn("z-table-caption", local.class)}
      data-slot="table-caption"
      {...others}
    />
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
}
