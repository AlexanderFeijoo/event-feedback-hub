"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { createContext, useContext, useState } from "react";

type ModalControls = {
  open: () => void;
  close: () => void;
};

const ModalControlsContext = createContext<ModalControls | null>(null);

export function useModalControls() {
  const ctx = useContext(ModalControlsContext);
  if (!ctx)
    throw new Error("useModalControls must be used within <CreateModal>");
  return ctx;
}

type modalProps = {
  children?: React.ReactNode;
  title: string;
  description: string;
  triggerText: string;
};

export default function Modal({
  children,
  title,
  description,
  triggerText,
}: modalProps) {
  const [open, setOpen] = useState(false);
  const controls = {
    open: () => setOpen(true),
    close: () => setOpen(false),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="w-full">
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="w-full"
            variant="outline"
          >
            {triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ModalControlsContext.Provider value={controls}>
            {children}
          </ModalControlsContext.Provider>
        </DialogContent>
      </div>
    </Dialog>
  );
}
