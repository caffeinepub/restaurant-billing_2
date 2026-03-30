import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type MenuItem = {
    name : Text;
    price : Nat;
  };

  type BillItem = {
    name : Text;
    price : Nat;
    quantity : Nat;
  };

  type Bill = {
    customerName : ?Text;
    items : [BillItem];
    discountPercent : Nat;
    gstPercent : Nat;
    subtotal : Nat;
    discountAmount : Nat;
    gstAmount : Nat;
    grandTotal : Nat;
    timestamp : Time.Time;
  };

  type OldActor = {};
  type NewActor = {
    menu : Map.Map<Nat, MenuItem>;
    bills : Map.Map<Nat, Bill>;
    billCounter : Nat;
  };

  public func run(_old : OldActor) : NewActor {
    {
      menu = Map.empty<Nat, MenuItem>();
      bills = Map.empty<Nat, Bill>();
      billCounter = 0;
    };
  };
};
