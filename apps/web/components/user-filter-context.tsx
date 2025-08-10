"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { User } from "@/app/lib/__generated__/graphql";

type userContext = {
  selectedUserId: User["id"] | null;
  setSelectedUserId: (id: User["id"] | null) => void;
};

const UserFilterContext = createContext<userContext | null>(null);

export function UserFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedUserId, setSelectedUserId] = useState<User["id"] | null>(null);
  const value = useMemo(
    () => ({ selectedUserId, setSelectedUserId }),
    [selectedUserId]
  );
  return (
    <UserFilterContext.Provider value={value}>
      {children}
    </UserFilterContext.Provider>
  );
}

export function useUserFilter() {
  const userContext = useContext(UserFilterContext);
  if (!userContext) throw new Error("Calling outside provider");
  return userContext;
}
