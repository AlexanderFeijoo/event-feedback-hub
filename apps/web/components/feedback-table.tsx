"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
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
import { Event, Feedback, FeedbackEdge } from "@/app/lib/__generated__/graphql";
import { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";

const EVENTS = gql`
  query Events {
    events {
      id
      name
      description
    }
  }
`;

const FEEDBACKS = gql`
  query Feedbacks($first: Int!, $after: String, $eventId: ID) {
    feedbacks(first: $first, after: $after, eventId: $eventId) {
      count
      edges {
        cursor
        node {
          id
          rating
          text
          createdAt
          event {
            id
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

const FEEDBACK_ADDED = gql`
  subscription Subscription($eventId: ID) {
    feedbackAdded(eventId: $eventId) {
      id
      createdAt
      rating
      text
      user {
        name
        email
      }
      event {
        id
        name
        description
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
];

export function FeedbackTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const {
    data: feedbackQueryData,
    loading: queryLoading,
    error: queryError,
    fetchMore,
    refetch,
  } = useQuery(FEEDBACKS, {
    variables: {
      first: pagination.pageSize,
      after: null,
      eventId: selectedEventId ?? null,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const { data: eventData } = useQuery(EVENTS);

  useEffect(() => {
    if (feedbackQueryData?.feedbacks?.edges) {
      setFeedbacks(
        feedbackQueryData.feedbacks.edges.map((edge: FeedbackEdge) => edge.node)
      );
    }
  }, [feedbackQueryData]);

  useEffect(() => {
    if (eventData?.events) setEvents(eventData.events);
  }, [eventData]);

  useEffect(() => {
    setPagination((p) => ({ pageIndex: 0, pageSize: p.pageSize }));
    refetch({
      first: pagination.pageSize,
      after: null,
      eventId: selectedEventId ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  useSubscription(FEEDBACK_ADDED, {
    variables: { eventId: selectedEventId ?? null },
    onData: ({ client, data }) => {
      const node = data?.data?.feedbackAdded;
      if (!node) return;

      client.cache.updateQuery(
        {
          query: FEEDBACKS,
          variables: {
            first: pagination.pageSize,
            after: null,
            eventId: selectedEventId ?? null,
          },
        },
        (prev) => {
          const prevEdges = prev?.feedbacks?.edges ?? [];
          if (prevEdges.some((e: any) => e?.node?.id === node.id)) return prev;

          const newEdge = {
            __typename: "FeedbackEdge",
            cursor: node.id,
            node,
          };

          return {
            feedbacks: {
              ...(prev?.feedbacks ?? {}),
              count: (prev?.feedbacks?.count ?? 0) + 1,
              edges: [newEdge, ...prevEdges],
              pageInfo: prev?.feedbacks?.pageInfo ?? {
                __typename: "PageInfo",
                hasNextPage: true,
                endCursor: prev?.feedbacks?.pageInfo?.endCursor ?? null,
              },
            },
          };
        }
      );
    },
  });

  console.log("feedbacks", feedbacks);

  const table = useReactTable({
    data: feedbacks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // derived state vars
  const hasNextPage =
    feedbackQueryData?.feedbacks?.pageInfo?.hasNextPage ?? false;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows =
    feedbackQueryData?.feedbacks?.count ??
    table.getFilteredRowModel().rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const fetchedRows = feedbackQueryData?.feedbacks?.edges?.length ?? 0;

  const getRowsForNext = async (
    index: number,
    size: number
  ): Promise<boolean> => {
    const nextRows = Math.min((index + 1) * size, totalRows);
    let currentRows = fetchedRows;
    let moreRows = hasNextPage;

    if (currentRows >= nextRows || !moreRows) return currentRows >= nextRows;

    let cursor = feedbackQueryData?.feedbacks?.pageInfo?.endCursor;
    if (!cursor) return currentRows >= nextRows;

    while (currentRows < nextRows && moreRows && cursor) {
      const resp = await fetchMore({
        variables: {
          first: nextRows - currentRows,
          after: cursor,
          eventId: selectedEventId ?? null,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          const prevEdges = prev?.feedbacks?.edges ?? [];
          const nextEdges = fetchMoreResult?.feedbacks?.edges ?? [];
          const pageInfo =
            fetchMoreResult?.feedbacks?.pageInfo ??
            prev?.feedbacks?.pageInfo ??
            null;
          const count =
            fetchMoreResult?.feedbacks?.count ?? prev?.feedbacks?.count ?? 0;
          return {
            feedbacks: {
              ...(prev?.feedbacks ?? {}),
              edges: [...prevEdges, ...nextEdges],
              pageInfo,
              count,
            },
          };
        },
      });
      const delta = resp.data?.feedbacks?.edges?.length ?? 0;
      currentRows += delta;
      moreRows = resp?.data?.feedbacks?.pageInfo?.hasNextPage ?? false;
      cursor = resp?.data?.feedbacks?.pageInfo?.endCursor ?? null;
    }
    return currentRows >= nextRows;
  };

  useEffect(() => {
    if (!feedbackQueryData) return;
    getRowsForNext(pageIndex, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageIndex,
    pageSize,
    feedbackQueryData?.feedbacks?.edges?.length,
    feedbackQueryData?.feedbacks?.pageInfo?.hasNextPage,
  ]);

  const handleNext = async () => {
    const nextIndex = Math.min(pageIndex + 1, totalPages - 1);
    if (nextIndex === pageIndex) return;
    const hasMoreRows = await getRowsForNext(nextIndex, pageSize);
    if (!hasMoreRows) return;
    table.setPageIndex(nextIndex);
  };

  const handleChangePageSize = (event) => {
    const nextPageSize = Number(event.target.value);

    const visibleRowIndex = pageIndex * pageSize;
    const newPageIndex = Math.floor(visibleRowIndex / nextPageSize);

    setPagination({ pageIndex: newPageIndex, pageSize: nextPageSize });

    getRowsForNext(newPageIndex, nextPageSize).then((hasMoreRows) => {
      if (hasMoreRows) table.setPageIndex(newPageIndex);
    });
  };

  // Early returns if errors or loading
  if (queryLoading && feedbacks.length === 0) return <p>Loading...</p>;
  if (queryError) return <p>Error: {queryError.message}</p>;

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Events <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {events &&
              events.map((event) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={event.id}
                    className="capitalize"
                  >
                    {event.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
        <ScrollArea className="h-[500px] rounded-md border">
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
          {table.getFilteredSelectedRowModel().rows.length} of {totalRows}{" "}
          row(s) selected.
        </div>
        <div className="text-sm text-muted-foreground">
          Page <strong>{pageIndex + 1}</strong> of <strong>{totalPages}</strong>
        </div>
        <select
          className="ml-2 h-9 rounded-md border px-2 text-sm"
          value={table.getState().pagination.pageSize}
          onChange={handleChangePageSize}
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
            onClick={handleNext}
            disabled={pageIndex >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
