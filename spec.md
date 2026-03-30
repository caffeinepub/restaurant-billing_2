# FRIENDS DHABA - Restaurant Billing App

## Current State
Empty project — no existing source files.

## Requested Changes (Diff)

### Add
- Restaurant billing app with business name "FRIENDS DHABA"
- Menu management: admin can add/remove menu items (name + price)
- Billing screen: select items from menu, set quantity, apply discount % and GST %
- Bill calculation: subtotal, discount amount, GST amount, grand total
- Bill history: all generated bills stored in backend with date/time, items, totals
- Print bill / PDF download for each bill
- Color theme: warm deep green or rich amber (not saffron)

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: menu items CRUD, bill generation (save bill with items + totals), bill history retrieval
2. Frontend: Menu Management page, Billing page, Bill History page with print/PDF
3. PDF via browser print (window.print with print-specific CSS) or jsPDF
