"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/Input";

type TransactionSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TransactionSearch({ value, onChange }: TransactionSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-9 left-3 h-4 w-4 text-muted" aria-hidden />
      <Input
        label="Search merchant"
        placeholder="Amazon, Swiggy, Jio..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
        autoComplete="off"
      />
    </div>
  );
}
