import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BillItem {
    name: string;
    quantity: bigint;
    price: bigint;
}
export interface MenuItem {
    id: bigint;
    name: string;
    price: bigint;
}
export type Time = bigint;
export interface Bill {
    customerName?: string;
    discountAmount: bigint;
    gstPercent: bigint;
    discountPercent: bigint;
    gstAmount: bigint;
    grandTotal: bigint;
    timestamp: Time;
    items: Array<BillItem>;
    subtotal: bigint;
}
export interface backendInterface {
    addMenuItem(name: string, price: bigint): Promise<bigint>;
    getAllBills(): Promise<Array<Bill>>;
    getBill(id: bigint): Promise<Bill>;
    getMenu(): Promise<Array<MenuItem>>;
    removeMenuItem(id: bigint): Promise<void>;
    saveBill(customerName: string | null, items: Array<BillItem>, discountPercent: bigint, gstPercent: bigint, subtotal: bigint, discountAmount: bigint, gstAmount: bigint, grandTotal: bigint): Promise<bigint>;
}
