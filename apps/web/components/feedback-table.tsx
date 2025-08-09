"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Feedback, FeedbackEdge } from "@/app/lib/__generated__/graphql";
import { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";

const FEEDBACK_ADDED = gql`
  subscription Subscription($eventId: ID) {
    feedbackAdded(eventId: $eventId) {
      createdAt
      rating
      text
      user {
        name
        email
      }
      event {
        name
      }
      id
    }
  }
`;

const FEEDBACKS = gql`
  query Feedbacks($first: Int!, $after: String) {
    feedbacks(first: $first, after: $after) {
      edges {
        cursor
        node {
          rating
          text
          createdAt
          id
          event {
            name
            description
          }
          user {
            email
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const columns: ColumnDef<Feedback>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "event",
    header: "Event",
    accessorFn: (row) => row?.event?.name,
    cell: ({ getValue, row }) => {
      // const event = row.original.user;
      return (
        <div className="underline-offset-4 hover:underline">
          {getValue<string>()}
        </div>
      );
    },

    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "user",
    header: "User",
    accessorFn: (row) => row?.user?.name,
    cell: ({ getValue, row }) => {
      // const user = row.original.user;
      return (
        <div className="underline-offset-4 hover:underline">
          {getValue<string>()}
        </div>
      );
    },

    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "feedback",
    accessorKey: "text",
    header: "Feedback",
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("feedback")}</div>
    ),
  },
  {
    id: "rating",
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            className="text-right"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rating
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">{row.getValue("rating")}</div>
      );
    },
  },
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const payment = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(payment.id)}
  //           >
  //             Copy payment ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>View customer</DropdownMenuItem>
  //           <DropdownMenuItem>View payment details</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];

export function FeedbackTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const {
    data: feedbackQueryData,
    loading: queryLoading,
    error: queryError,
    fetchMore,
  } = useQuery(FEEDBACKS, {
    variables: { first: 5, after: null },
    fetchPolicy: "cache-and-network",
  });

  const { data: feedbackSubscriptionData, error: subscriptionError } =
    useSubscription(FEEDBACK_ADDED);

  useEffect(() => {
    if (feedbackQueryData?.feedbacks?.edges) {
      setFeedbacks(
        feedbackQueryData.feedbacks.edges.map((edge: FeedbackEdge) => edge.node)
      );
    }
  }, [feedbackQueryData]);

  useEffect(() => {
    if (feedbackSubscriptionData?.feedbackAdded) {
      setFeedbacks((prev) => {
        const updated = [feedbackSubscriptionData.feedbackAdded, ...prev];
        return updated;
      });
    }
  }, [feedbackSubscriptionData]);

  console.log("feedbacks", feedbacks);

  const table = useReactTable({
    data: feedbacks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  const loadMore = () => {
    const endCursor = feedbackQueryData?.feedbacks?.pageInfo?.endCursor;

    if (!endCursor) return;

    fetchMore({
      variables: { first: 5, after: endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          feedbacks: {
            ...fetchMoreResult.feedbacks,
            edges: [
              ...prev.feedbacks.edges,
              ...fetchMoreResult.feedbacks.edges,
            ],
            pageInfo: fetchMoreResult.feedbacks.pageInfo,
          },
        };
      },
    });
  };

  // Early returns if errors or loading
  if (queryLoading && feedbacks.length === 0) return <p>Loading...</p>;
  if (queryError) return <p>Error: {queryError.message}</p>;
  if (subscriptionError)
    return <p>Subscription Error: {subscriptionError.message}</p>;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter events..."
          value={(table.getColumn("event")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("event")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={loadMore}>Load More</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <ScrollArea className="h-[500] rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="text-sm text-muted-foreground">
          Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
          <strong>{table.getPageCount()}</strong>
        </div>
        <select
          className="ml-2 h-9 rounded-md border px-2 text-sm"
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((ps) => (
            <option key={ps} value={ps}>
              {ps} / page
            </option>
          ))}
        </select>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
