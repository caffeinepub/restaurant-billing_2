# Restaurant Billing

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Restaurant billing UI with item entry form (name, price, qty)
- Bill items list showing each item and line total
- Discount % and GST % inputs
- Summary section: subtotal, discount amount, GST amount, grand total
- "Generate Bill" button (print/display bill)
- Remove item capability

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Build frontend-only billing app (no backend needed — purely client-side state)
2. Implement item add/remove
3. Calculate subtotal, discount, GST, and grand total
4. Generate Bill button triggers a printable bill view
