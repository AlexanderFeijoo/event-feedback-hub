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
      count
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const {
    data: feedbackQueryData,
    loading: queryLoading,
    error: queryError,
    fetchMore,
  } = useQuery(FEEDBACKS, {
    variables: { first: pagination.pageSize, after: null },
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

  // useEffect(() => {
  //   if (feedbackSubscriptionData?.feedbackAdded) {
  //     setFeedbacks((prev) => {
  //       const updated = [feedbackSubscriptionData.feedbackAdded, ...prev];
  //       return updated;
  //     });
  //   }
  // }, [feedbackSubscriptionData]);
  const FEEDBACK_NODE = gql`
    fragment FeedbackNode on Feedback {
      id
      rating
      text
      createdAt
      user {
        name
        email
      }
      event {
        name
      }
    }
  `;

  useSubscription(FEEDBACK_ADDED, {
    onData: ({ client, data }) => {
      const node = data?.data?.feedbackAdded;
      if (!node) return;

      const nodeRef = client.cache.writeFragment({
        data: node,
        fragment: FEEDBACK_NODE,
      });

      client.cache.modify({
        fields: {
          feedbacks(
            existing = {
              __typename: "FeedbackConnection",
              count: 0,
              edges: [],
              pageInfo: {
                __typename: "PageInfo",
                hasNextPage: false,
                endCursor: null,
              },
            }
          ) {
            const edges = existing.edges ?? [];
            const already = edges.some((e) => {
              const n = e?.node;
              return (
                n && client.cache.identify(n) === client.cache.identify(nodeRef)
              );
            });
            if (already) {
              return existing;
            }

            const newEdge = {
              __typename: "FeedbackEdge",
              cursor: node.id,
              node: nodeRef,
            };

            return {
              ...existing,
              count: (existing.count ?? 0) + 1,
              edges: [newEdge, ...edges],
              pageInfo: existing.pageInfo,
            };
          },
        },
      });
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
        variables: { first: nextRows - currentRows, after: cursor },
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
    getRowsForNext(pageIndex, pageSize);
  }, [pageIndex, pageSize, hasNextPage, fetchedRows]);

  const handleNext = async () => {
    const nextIndex = Math.min(pageIndex + 1, totalPages - 1);
    if (nextIndex === pageIndex) return;
    const hasMoreRows = await getRowsForNext(nextIndex, pageSize);
    if (!hasMoreRows) return;
    table.setPageIndex(nextIndex);
  };

  const loadMore = () => {
    const endCursor = feedbackQueryData?.feedbacks?.pageInfo?.endCursor;

    if (!endCursor) return;

    fetchMore({
      variables: { first: pagination.pageSize, after: endCursor },
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
