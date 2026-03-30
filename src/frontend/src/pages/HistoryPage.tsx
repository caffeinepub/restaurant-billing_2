import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Printer,
  ReceiptText,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Bill } from "../backend";
import { useGetAllBills } from "../hooks/useQueries";

function rupees(paise: bigint): number {
  return Number(paise) / 100;
}

function formatTimestamp(ts: bigint): { date: string; time: string } {
  // Motoko Time is in nanoseconds
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

function BillReceipt({ bill, billNo }: { bill: Bill; billNo: string }) {
  const { date, time } = formatTimestamp(bill.timestamp);
  const subtotal = rupees(bill.subtotal);
  const discountAmt = rupees(bill.discountAmount);
  const gstAmt = rupees(bill.gstAmount);
  const grandTotal = rupees(bill.grandTotal);

  return (
    <div className="p-6 font-body">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl font-bold tracking-wide">
          FRIENDS DHABA
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your Friendly Neighbourhood Dhaba
        </p>
        <p className="text-xs text-muted-foreground mt-1">Tax Invoice</p>
        <div className="mt-2 text-xs text-muted-foreground flex justify-between">
          <span>Bill No: {billNo}</span>
          <span>
            {date} {time}
          </span>
        </div>
        {bill.customerName && (
          <p className="mt-1 text-xs font-medium">
            Customer: {bill.customerName}
          </p>
        )}
      </div>

      <Separator className="mb-3" />

      <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground mb-1.5 px-1">
        <span className="col-span-5">Item</span>
        <span className="col-span-2 text-right">Qty</span>
        <span className="col-span-2 text-right">Rate</span>
        <span className="col-span-3 text-right">Amt</span>
      </div>
      <Separator className="mb-2" />

      <div className="space-y-1 mb-3">
        {bill.items.map((item) => (
          <div
            key={`${item.name}-${Number(item.price)}`}
            className="grid grid-cols-12 text-sm px-1"
          >
            <span className="col-span-5 truncate">{item.name}</span>
            <span className="col-span-2 text-right">
              {Number(item.quantity)}
            </span>
            <span className="col-span-2 text-right">
              ₹{rupees(item.price).toFixed(0)}
            </span>
            <span className="col-span-3 text-right font-medium">
              ₹{(rupees(item.price) * Number(item.quantity)).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <Separator className="mb-2" />

      <div className="space-y-1 text-sm px-1">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {discountAmt > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Discount ({Number(bill.discountPercent)}%)</span>
            <span>− ₹{discountAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>GST ({Number(bill.gstPercent)}%)</span>
          <span>+ ₹{gstAmt.toFixed(2)}</span>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex justify-between text-base font-bold px-1">
        <span>GRAND TOTAL</span>
        <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
      </div>

      <div className="mt-5 text-center">
        <p className="text-xs text-muted-foreground">
          Thank you for dining with us!
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Please visit again 🙏
        </p>
      </div>
    </div>
  );
}

function BillRow({ bill, index }: { bill: Bill; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const { date, time } = formatTimestamp(bill.timestamp);
  const grandTotal = rupees(bill.grandTotal);
  const billNo = `FD-${String(index + 1).padStart(4, "0")}`;

  return (
    <>
      <motion.div
        data-ocid={`history.item.${index + 1}`}
        layout
        className="border border-border rounded-lg overflow-hidden mb-3"
      >
        {/* Row header */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ReceiptText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{billNo}</span>
                {bill.customerName && (
                  <Badge variant="secondary" className="text-xs">
                    <User className="w-2.5 h-2.5 mr-1" />
                    {bill.customerName}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {time}
                </span>
                <span>
                  {bill.items.length} item{bill.items.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className="font-bold text-primary">
              ₹{grandTotal.toFixed(2)}
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Separator />
              <div className="p-4 space-y-2">
                {bill.items.map((item) => (
                  <div
                    key={`${item.name}-${Number(item.price)}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.name} × {Number(item.quantity)}
                    </span>
                    <span className="font-medium">
                      ₹{(rupees(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator className="my-1" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{rupees(bill.subtotal).toFixed(2)}</span>
                </div>
                {rupees(bill.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Discount ({Number(bill.discountPercent)}%)</span>
                    <span>− ₹{rupees(bill.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST ({Number(bill.gstPercent)}%)</span>
                  <span>+ ₹{rupees(bill.gstAmount).toFixed(2)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
                <Button
                  data-ocid={`history.reprint_button.${index + 1}`}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setShowPrint(true)}
                >
                  <Printer className="w-3.5 h-3.5 mr-2" />
                  Print / Download PDF
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Print Dialog */}
      <Dialog open={showPrint} onOpenChange={setShowPrint}>
        <DialogContent
          data-ocid={`history.print_dialog.${index + 1}`}
          className="max-w-sm w-full p-0 gap-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Bill Receipt {billNo}</DialogTitle>
          </DialogHeader>
          <BillReceipt bill={bill} billNo={billNo} />
          <div className="flex gap-2 px-6 pb-5 no-print">
            <Button
              data-ocid={`history.print_dialog.close_button.${index + 1}`}
              variant="outline"
              className="flex-1"
              onClick={() => setShowPrint(false)}
            >
              Close
            </Button>
            <Button
              data-ocid={`history.print_dialog.confirm_button.${index + 1}`}
              onClick={() => window.print()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print / PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function HistoryPage() {
  const { data: bills, isLoading } = useGetAllBills();

  const sorted = bills
    ? [...bills].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-warm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-primary" />
              Bill History
              {sorted.length > 0 && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {sorted.length} bill{sorted.length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {isLoading ? (
              <div data-ocid="history.list.loading_state" className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div
                data-ocid="history.list.empty_state"
                className="text-center py-12 text-muted-foreground text-sm"
              >
                <ReceiptText className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="font-medium">No bills yet</p>
                <p className="text-xs mt-1">Generated bills will appear here</p>
              </div>
            ) : (
              sorted.map((bill, idx) => (
                <BillRow key={Number(bill.timestamp)} bill={bill} index={idx} />
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
