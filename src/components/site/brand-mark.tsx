import { Link } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";

export function BrandMark() {
  return (
    <Link to="/" className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-300 group-hover:-rotate-6">
        <ReceiptText className="h-4 w-4" />
      </span>
      <span className="text-base font-bold tracking-tight text-foreground">SmartInvoice</span>
    </Link>
  );
}
