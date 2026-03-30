import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BillItem } from "../backend";
import { useActor } from "./useActor";

export function useGetMenu() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenu();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, price }: { name: string; price: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.addMenuItem(name, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useRemoveMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeMenuItem(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useGetAllBills() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBills();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string | null;
      items: Array<BillItem>;
      discountPercent: bigint;
      gstPercent: bigint;
      subtotal: bigint;
      discountAmount: bigint;
      gstAmount: bigint;
      grandTotal: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.saveBill(
        params.customerName,
        params.items,
        params.discountPercent,
        params.gstPercent,
        params.subtotal,
        params.discountAmount,
        params.gstAmount,
        params.grandTotal,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}
