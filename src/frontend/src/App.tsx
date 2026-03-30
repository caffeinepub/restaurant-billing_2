import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Printer, Receipt, Trash2, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface BillItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

let nextId = 1;

export default function App() {
  const [items, setItems] = useState<BillItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [gst, setGst] = useState("5");
  const [showBill, setShowBill] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const addItem = () => {
    if (!name.trim() || !price || Number(price) <= 0) return;
    setItems((prev) => [
      ...prev,
      {
        id: nextId++,
        name: name.trim(),
        price: Number(price),
        qty: Number(qty) || 1,
      },
    ]);
    setName("");
    setPrice("");
    setQty("1");
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addItem();
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmt = (subtotal * (Number(discount) || 0)) / 100;
  const gstAmt = ((subtotal - discountAmt) * (Number(gst) || 0)) / 100;
  const grandTotal = subtotal - discountAmt + gstAmt;

  const handlePrint = () => {
    setShowBill(true);
  };

  const doPrint = () => {
    window.print();
  };

  const year = new Date().getFullYear();
  const now = new Date();
  const billDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const billTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const billNo = `FD-${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="no-print bg-primary text-primary-foreground py-5 px-6 shadow-warm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <UtensilsCrossed className="w-8 h-8 opacity-90" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-wide leading-none">
              FRIENDS DHABA
            </h1>
            <p className="text-primary-foreground/75 text-sm mt-0.5 font-body">
              Billing System
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Add Item Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="no-print"
        >
          <Card className="shadow-warm border-border">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add Item
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-5 space-y-1">
                  <Label
                    htmlFor="item-name"
                    className="text-xs text-muted-foreground"
                  >
                    Item Name
                  </Label>
                  <Input
                    id="item-name"
                    data-ocid="item.input"
                    placeholder="e.g. Dal Makhani"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-9"
                  />
                </div>
                <div className="col-span-4 space-y-1">
                  <Label
                    htmlFor="item-price"
                    className="text-xs text-muted-foreground"
                  >
                    Price (₹)
                  </Label>
                  <Input
                    id="item-price"
                    data-ocid="price.input"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-9"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label
                    htmlFor="item-qty"
                    className="text-xs text-muted-foreground"
                  >
                    Qty
                  </Label>
                  <Input
                    id="item-qty"
                    data-ocid="qty.input"
                    placeholder="1"
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-9"
                  />
                </div>
              </div>
              <Button
                data-ocid="item.primary_button"
                onClick={addItem}
                className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Bill
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bill Items Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <Card className="shadow-warm border-border">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Bill Items
                {items.length > 0 && (
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {/* Items list */}
              <div className="min-h-[80px]">
                <AnimatePresence>
                  {items.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      data-ocid="bill.empty_state"
                      className="text-center py-8 text-muted-foreground text-sm"
                    >
                      <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No items added yet
                    </motion.div>
                  ) : (
                    items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ duration: 0.2 }}
                        data-ocid={`bill.item.${index + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border/60 last:border-0 group"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm text-foreground truncate block">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ₹{item.price.toFixed(2)} × {item.qty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="font-semibold text-sm text-foreground">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            data-ocid={`bill.delete_button.${index + 1}`}
                            onClick={() => removeItem(item.id)}
                            className="no-print text-muted-foreground hover:text-destructive transition-colors p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Discount & GST */}
              <div className="no-print mt-4 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="discount"
                    className="text-xs text-muted-foreground"
                  >
                    Discount (%)
                  </Label>
                  <Input
                    id="discount"
                    data-ocid="discount.input"
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="gst"
                    className="text-xs text-muted-foreground"
                  >
                    GST (%)
                  </Label>
                  <Input
                    id="gst"
                    data-ocid="gst.input"
                    type="number"
                    min="0"
                    max="100"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 rounded-lg bg-secondary/60 p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount ({discount || 0}%)
                  </span>
                  <span className="text-destructive font-medium">
                    − ₹{discountAmt.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    GST ({gst || 0}%)
                  </span>
                  <span className="text-green-700 font-medium">
                    + ₹{gstAmt.toFixed(2)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Generate Bill Button */}
              <Button
                data-ocid="bill.primary_button"
                onClick={handlePrint}
                disabled={items.length === 0}
                className="no-print mt-4 w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                <Printer className="w-4 h-4 mr-2" />
                Generate Bill
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="no-print py-6 text-center text-xs text-muted-foreground">
        © {year}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Bill Preview Dialog */}
      <Dialog open={showBill} onOpenChange={setShowBill}>
        <DialogContent
          data-ocid="bill.dialog"
          className="max-w-sm w-full p-0 gap-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Bill Preview</DialogTitle>
          </DialogHeader>
          <div ref={printRef} className="p-6 font-body">
            {/* Bill Header */}
            <div className="text-center mb-4">
              <h2 className="font-display text-2xl font-bold text-foreground tracking-wide">
                FRIENDS DHABA
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tax Invoice
              </p>
              <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                <span>Bill No: {billNo}</span>
                <span>
                  {billDate} {billTime}
                </span>
              </div>
            </div>

            <Separator className="mb-3" />

            {/* Column headers */}
            <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground mb-1.5 px-1">
              <span className="col-span-5">Item</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-3 text-right">Amt</span>
            </div>

            <Separator className="mb-2" />

            {/* Items */}
            <div className="space-y-1 mb-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 text-sm px-1">
                  <span className="col-span-5 truncate">{item.name}</span>
                  <span className="col-span-2 text-right">{item.qty}</span>
                  <span className="col-span-2 text-right">
                    ₹{item.price.toFixed(0)}
                  </span>
                  <span className="col-span-3 text-right font-medium">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="mb-2" />

            {/* Summary */}
            <div className="space-y-1 text-sm px-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount ({discount}%)</span>
                  <span>− ₹{discountAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>GST ({gst}%)</span>
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

          {/* Dialog Actions */}
          <div className="flex gap-2 px-6 pb-5">
            <Button
              data-ocid="bill.cancel_button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowBill(false)}
            >
              Close
            </Button>
            <Button
              data-ocid="bill.confirm_button"
              onClick={doPrint}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
