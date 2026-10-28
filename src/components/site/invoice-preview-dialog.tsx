import { Download, PenLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceDocument } from "@/components/site/invoice-document";
import type { InvoiceDoc } from "@/lib/invoice-doc";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";

/** Detailed preview of an invoice with a real PDF download. */
export function InvoicePreviewDialog({
  doc,
  open,
  onOpenChange,
  badge,
  onCreateOwn,
}: {
  doc: InvoiceDoc;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  badge?: string | undefined;
  onCreateOwn?: (() => void) | undefined;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-[#0b1220] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice {doc.invoiceNumber}</DialogTitle>
          <DialogDescription>Sample invoice for illustration. Download it as a PDF, or create your own in the live demo.</DialogDescription>
        </DialogHeader>
        <InvoiceDocument doc={doc} badge={badge} />
        <DialogFooter className="gap-2 sm:gap-2">
          {onCreateOwn ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onCreateOwn();
              }}
            >
              <PenLine /> Create your own
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => {
              downloadInvoicePdf(doc);
              toast.success(`${doc.invoiceNumber}.pdf downloaded`);
            }}
          >
            <Download /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
