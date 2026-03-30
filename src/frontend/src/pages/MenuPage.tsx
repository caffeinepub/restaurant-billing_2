import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddMenuItem,
  useGetMenu,
  useRemoveMenuItem,
} from "../hooks/useQueries";

function rupees(paise: bigint): number {
  return Number(paise) / 100;
}

export default function MenuPage() {
  const { data: menuItems, isLoading } = useGetMenu();
  const addMenuItem = useAddMenuItem();
  const removeMenuItem = useRemoveMenuItem();

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Item name is required");
      return;
    }
    const priceRupees = Number.parseFloat(newPrice);
    if (!newPrice || Number.isNaN(priceRupees) || priceRupees <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await addMenuItem.mutateAsync({
        name: newName.trim(),
        price: BigInt(Math.round(priceRupees * 100)),
      });
      setNewName("");
      setNewPrice("");
      toast.success(`"${newName.trim()}" added to menu`);
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleRemove = async (index: number) => {
    setRemovingIndex(index);
    try {
      await removeMenuItem.mutateAsync(BigInt(index));
      toast.success("Item removed from menu");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemovingIndex(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Add Item */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-warm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add Menu Item
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="menu-name"
                  className="text-xs text-muted-foreground"
                >
                  Item Name
                </Label>
                <Input
                  id="menu-name"
                  data-ocid="menu.name.input"
                  placeholder="e.g. Butter Chicken"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-9"
                />
              </div>
              <div className="w-28 space-y-1">
                <Label
                  htmlFor="menu-price"
                  className="text-xs text-muted-foreground"
                >
                  Price (₹)
                </Label>
                <Input
                  id="menu-price"
                  data-ocid="menu.price.input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-9"
                />
              </div>
              <Button
                data-ocid="menu.add_item.primary_button"
                onClick={handleAdd}
                disabled={addMenuItem.isPending}
                className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5"
              >
                {addMenuItem.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
      >
        <Card className="shadow-warm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Menu Items
              {menuItems && menuItems.length > 0 && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {menuItems.length} item{menuItems.length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {isLoading ? (
              <div data-ocid="menu.list.loading_state" className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : !menuItems || menuItems.length === 0 ? (
              <div
                data-ocid="menu.list.empty_state"
                className="text-center py-10 text-muted-foreground text-sm"
              >
                <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No menu items yet. Add your first item above.
              </div>
            ) : (
              <ScrollArea className="h-[60vh] pr-3">
                <AnimatePresence>
                  {menuItems.map((item, idx) => (
                    <motion.div
                      key={`${item.name}-${idx}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      data-ocid={`menu.item.${idx + 1}`}
                      className="flex items-center justify-between py-3 border-b border-border/60 last:border-0 group"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{rupees(item.price).toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-ocid={`menu.delete_button.${idx + 1}`}
                        onClick={() => handleRemove(idx)}
                        disabled={removingIndex === idx}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        {removingIndex === idx ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
