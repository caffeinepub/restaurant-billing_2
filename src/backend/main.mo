import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";



actor {
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

  let menu = Map.empty<Nat, MenuItem>();
  let bills = Map.empty<Nat, Bill>();
  var billCounter = 0;

  public shared ({ caller }) func addMenuItem(name : Text, price : Nat) : async Nat {
    let id = menu.size();
    let item : MenuItem = { name; price };
    menu.add(id, item);
    id;
  };

  public shared ({ caller }) func removeMenuItem(id : Nat) : async () {
    if (not menu.containsKey(id)) {
      Runtime.trap("Menu item with id " # id.toText() # " does not exist");
    };
    menu.remove(id);
  };

  public query ({ caller }) func getMenu() : async [MenuItem] {
    menu.values().toArray();
  };

  public shared ({ caller }) func saveBill(
    customerName : ?Text,
    items : [BillItem],
    discountPercent : Nat,
    gstPercent : Nat,
    subtotal : Nat,
    discountAmount : Nat,
    gstAmount : Nat,
    grandTotal : Nat,
  ) : async Nat {
    let id = billCounter;
    billCounter += 1;

    let bill : Bill = {
      customerName;
      items;
      discountPercent;
      gstPercent;
      subtotal;
      discountAmount;
      gstAmount;
      grandTotal;
      timestamp = Time.now();
    };

    bills.add(id, bill);
    id;
  };

  public query ({ caller }) func getAllBills() : async [Bill] {
    bills.values().toArray();
  };

  public query ({ caller }) func getBill(id : Nat) : async Bill {
    switch (bills.get(id)) {
      case (null) { Runtime.trap("Bill with id " # id.toText() # " does not exist") };
      case (?bill) { bill };
    };
  };
};
