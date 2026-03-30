import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetMenu, useSaveBill } from "../hooks/useQueries";

interface CartItem {
  name: string;
  price: number; // in rupees
  quantity: number;
}

function rupees(paise: bigint): number {
  return Number(paise) / 100;
}

function toPaise(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

export default function BillingPage() {
  const { data: menuItems, isLoading: menuLoading } = useGetMenu();
  const saveBill = useSaveBill();

  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState("0");
  const [gst, setGst] = useState("5");
  const [showReceipt, setShowReceipt] = useState(false);
  const [billNo, setBillNo] = useState("");
  const [billTimestamp, setBillTimestamp] = useState<Date>(new Date());
  const [menuSearch, setMenuSearch] = useState("");

  const filteredMenu = menuItems
    ? menuItems.filter((item) =>
        item.name.toLowerCase().includes(menuSearch.toLowerCase()),
      )
    : [];

  const cartItems = Array.from(cart.values());
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountPct = Math.max(0, Math.min(100, Number(discount) || 0));
  const gstPct = Math.max(0, Math.min(100, Number(gst) || 0));
  const discountAmt = (subtotal * discountPct) / 100;
  const gstAmt = ((subtotal - discountAmt) * gstPct) / 100;
  const grandTotal = subtotal - discountAmt + gstAmt;

  const setQty = (name: string, price: number, qty: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(name);
      } else {
        next.set(name, { name, price, quantity: qty });
      }
      return next;
    });
  };

  const getQty = (name: string) => cart.get(name)?.quantity ?? 0;

  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      toast.error("Add at least one item to the bill");
      return;
    }
    try {
      const now = new Date();
      setBillTimestamp(now);
      const newBillNo = `FD-${Date.now().toString().slice(-6)}`;
      setBillNo(newBillNo);

      await saveBill.mutateAsync({
        customerName: customerName.trim() || null,
        items: cartItems.map((i) => ({
          name: i.name,
          quantity: BigInt(i.quantity),
          price: toPaise(i.price),
        })),
        discountPercent: BigInt(discountPct),
        gstPercent: BigInt(gstPct),
        subtotal: toPaise(subtotal),
        discountAmount: toPaise(discountAmt),
        gstAmount: toPaise(gstAmt),
        grandTotal: toPaise(grandTotal),
      });

      setShowReceipt(true);
    } catch {
      toast.error("Failed to save bill. Please try again.");
    }
  };

  const handleClear = () => {
    setCart(new Map());
    setCustomerName("");
    setDiscount("0");
    setGst("5");
    setShowReceipt(false);
  };

  const doPrint = () => {
    window.print();
  };

  const billDate = billTimestamp.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const billTime = billTimestamp.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Customer Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="no-print"
      >
        <Card className="shadow-warm">
          <CardContent className="pt-4 pb-4 px-5">
            <div className="space-y-1">
              <Label
                htmlFor="customer-name"
                className="text-xs text-muted-foreground"
              >
                Customer Name (optional)
              </Label>
              <Input
                id="customer-name"
                data-ocid="billing.customer.input"
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
        className="no-print"
      >
        <Card className="shadow-warm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Menu
              {cart.size > 0 && (
                <Badge className="ml-auto bg-accent text-accent-foreground">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {menuLoading ? (
              <div data-ocid="billing.menu.loading_state" className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : !menuItems || menuItems.length === 0 ? (
              <div
                data-ocid="billing.menu.empty_state"
                className="text-center py-10 text-muted-foreground text-sm"
              >
                <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No menu items yet. Add items in Menu Management.
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="h-9 pl-9"
                  />
                </div>
                {filteredMenu.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No items match "{menuSearch}"
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredMenu.map((item) => {
                      const qty = getQty(item.name);
                      const price = rupees(item.price);
                      return (
                        <div
                          key={String(item.id)}
                          data-ocid={`billing.menu.item.${item.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {qty > 0 && (
                              <span className="text-sm font-semibold text-primary min-w-[3rem] text-right">
                                ₹{(price * qty).toFixed(2)}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              {qty > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQty(item.name, price, qty - 1)
                                  }
                                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              )}
                              {qty > 0 && (
                                <span className="w-6 text-center text-sm font-bold">
                                  {qty}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setQty(item.name, price, qty + 1)
                                }
                                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bill Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
      >
        <Card className="shadow-warm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Bill Summary
              {cartItems.length > 0 && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {/* Selected items */}
            <AnimatePresence>
              {cartItems.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  data-ocid="billing.cart.empty_state"
                  className="text-center py-6 text-muted-foreground text-sm no-print"
                >
                  Select items from the menu above
                </motion.div>
              ) : (
                cartItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    transition={{ duration: 0.2 }}
                    data-ocid={`billing.cart.item.${idx + 1}`}
                    className="flex items-center justify-between py-2 border-b border-border/60 last:border-0 group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm truncate block">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="font-semibold text-sm">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        data-ocid={`billing.cart.delete_button.${idx + 1}`}
                        onClick={() => setQty(item.name, item.price, 0)}
                        className="no-print text-muted-foreground hover:text-destructive transition-colors p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

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
                  data-ocid="billing.discount.input"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gst" className="text-xs text-muted-foreground">
                  GST (%)
                </Label>
                <Input
                  id="gst"
                  data-ocid="billing.gst.input"
                  type="number"
                  min="0"
                  max="100"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 rounded-lg bg-secondary/60 p-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount ({discountPct}%)
                  </span>
                  <span className="text-destructive font-medium">
                    − ₹{discountAmt.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({gstPct}%)</span>
                <span className="font-medium text-primary">
                  + ₹{gstAmt.toFixed(2)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Grand Total</span>
                <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              data-ocid="billing.generate_bill.primary_button"
              onClick={handleGenerateBill}
              disabled={cartItems.length === 0 || saveBill.isPending}
              className="no-print mt-4 w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-gold"
            >
              {saveBill.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 mr-2" />
              )}
              {saveBill.isPending ? "Saving..." : "Generate Bill"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent
          data-ocid="billing.receipt.dialog"
          className="max-w-sm w-full p-0 gap-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Bill Receipt</DialogTitle>
          </DialogHeader>

          {/* Printable Receipt */}
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
                  {billDate} {billTime}
                </span>
              </div>
              {customerName && (
                <p className="mt-1 text-xs font-medium">
                  Customer: {customerName}
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
              {cartItems.map((item) => (
                <div key={item.name} className="grid grid-cols-12 text-sm px-1">
                  <span className="col-span-5 truncate">{item.name}</span>
                  <span className="col-span-2 text-right">{item.quantity}</span>
                  <span className="col-span-2 text-right">
                    ₹{item.price.toFixed(0)}
                  </span>
                  <span className="col-span-3 text-right font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
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
                  <span>Discount ({discountPct}%)</span>
                  <span>− ₹{discountAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>GST ({gstPct}%)</span>
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

          <div className="flex gap-2 px-6 pb-5 no-print">
            <Button
              data-ocid="billing.receipt.close_button"
              variant="outline"
              className="flex-1"
              onClick={handleClear}
            >
              New Bill
            </Button>
            <Button
              data-ocid="billing.receipt.confirm_button"
              onClick={doPrint}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print / PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
