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
import { ArrowUpDown, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import EventSelector from "./event-selector";
import RatingDisplay from "./feedback-rating-display";
import FeedbackRating from "./feedback-rating-select";
import { useEventFilter } from "@/components/event-filter-context";

const FEEDBACKS = gql`
  query Feedbacks($first: Int!, $after: String, $eventId: ID, $ratingGte: Int) {
    feedbacks(
      first: $first
      after: $after
      eventId: $eventId
      ratingGte: $ratingGte
    ) {
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
  subscription FeedbackAdded($eventId: ID, $ratingGte: Int) {
    feedbackAdded(eventId: $eventId, ratingGte: $ratingGte) {
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
    cell: ({ getValue }) => {
      return (
        <div className="line-clamp-2 whitespace-normal break-words underline-offset-4 hover:underline">
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
    cell: ({ getValue }) => {
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
      <div className="line-clamp whitespace-normal break-words lowercase">
        {row.getValue("feedback")}
      </div>
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
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rating
            {/* <ArrowUpDown /> */}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <RatingDisplay rating={row.getValue("rating")} />
        // <div className="text-right font-medium">{)}</div>
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
  const { selectedEventId, setSelectedEventId } = useEventFilter();
  const [rating, setRating] = useState<number | null>(null);

  const ratingGteVar = rating != null && rating > 0 ? rating : null;
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
      ratingGte: ratingGteVar,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (feedbackQueryData?.feedbacks?.edges) {
      setFeedbacks(
        feedbackQueryData.feedbacks.edges.map((edge: FeedbackEdge) => edge.node)
      );
    }
  }, [feedbackQueryData]);

  useEffect(() => {
    setPagination((p) => ({ pageIndex: 0, pageSize: p.pageSize }));
    refetch({
      first: pagination.pageSize,
      after: null,
      eventId: selectedEventId ?? null,
      ratingGte: ratingGteVar,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, ratingGteVar]);

  useSubscription(FEEDBACK_ADDED, {
    variables: { eventId: selectedEventId ?? null, ratingGte: ratingGteVar },
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
            ratingGte: ratingGteVar,
          },
        },
        (prev) => {
          const prevEdges: FeedbackEdge[] = prev?.feedbacks?.edges ?? [];
          if (prevEdges.some((e) => e?.node?.id === node.id)) return prev;

          if (ratingGteVar != null && node.rating < ratingGteVar) return prev;
          if (selectedEventId && node.event.id !== selectedEventId) return prev;

          const newEdge: FeedbackEdge = {
            __typename: "FeedbackEdge",
            cursor: node.id,
            node,
          };

          if (ratingGteVar == null) {
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

          const sortEdges = (a: FeedbackEdge, b: FeedbackEdge) => {
            if (a.node.rating !== b.node.rating)
              return a.node.rating - b.node.rating;
            const ta = Date.parse(a.node.createdAt);
            const tb = Date.parse(b.node.createdAt);
            if (ta !== tb) return tb - ta;
            return b.node.id.localeCompare(a.node.id);
          };

          const nextEdges = [...prevEdges, newEdge].sort(sortEdges);

          return {
            feedbacks: {
              ...(prev?.feedbacks ?? {}),
              count: (prev?.feedbacks?.count ?? 0) + 1,
              edges: nextEdges,
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
          ratingGte: ratingGteVar,
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

  const handleChangePageSize = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
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
        <EventSelector value={selectedEventId} onChange={setSelectedEventId} />
        {selectedEventId && (
          <Button
            onClick={() => setSelectedEventId(null)}
            variant="ghost"
            size="icon"
            className="size-8"
          >
            <X />
          </Button>
        )}
        <div className="ml-4 flex">
          <span className="mr-1 align-middle">Mininum Rating:</span>
          <FeedbackRating
            value={rating ?? 0}
            onChange={(v) => setRating(v === rating ? null : v)}
          />
          {rating != null && (
            <Button
              onClick={() => setRating(null)}
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <X />
            </Button>
          )}
        </div>
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
          <Table className="table-fixed">
            <colgroup>
              <col style={{ width: 40 }} />
              <col style={{ width: 300 }} />
              <col style={{ width: 200 }} />
              <col />
              <col style={{ width: 150 }} />
            </colgroup>
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
