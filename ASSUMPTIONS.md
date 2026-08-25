# Assumptions

Product decisions that were not fully specified by the assessment.

## Reward coin cap

Coins = `floor(max(amount, 0) / 100)`, then capped at **50 coins** per successful transaction.

The assessment specifies 1 coin per ₹100 and a per-transaction cap, but not the exact cap. 50 coins (₹5,000 of spend) is a reasonable consumer-app ceiling so a single large payment cannot dominate the wallet.

Configured by `MAX_COINS_PER_TRANSACTION`.

## Fractional amounts

`floor` is applied after dividing by 100. ₹199.99 earns 1 coin. ₹99.99 earns 0.

## Negative amounts

Negative amounts are stored as-is. They earn **0 coins** and are **excluded** from spending analytics. They are treated as refunds/reversals, not ordinary spend.

## Statuses that earn coins

Only normalized `SUCCESS` payments earn coins. `FAILED` and `PENDING` earn 0.

## Statuses that count toward spending analytics

Only `SUCCESS` transactions with `amount > 0` are included in category spend, monthly spend, and total successful spend.

## Missing categories

`null` / blank categories are stored as SQL `NULL`. The API and UI expose them as `Uncategorized`. Filtering with `category=Uncategorized` matches `NULL` categories.

## Date range inclusivity

`from_date` and `to_date` are **inclusive calendar days in Asia/Kolkata**.

- `from_date=2025-10-03` means `timestamp >= 2025-10-03 00:00:00+05:30`
- `to_date=2025-10-03` means `timestamp < 2025-10-04 00:00:00+05:30`

## Timezone normalization

All timestamps are stored as `TIMESTAMPTZ` (UTC). Parsing rules:

| Source | Interpretation |
| --- | --- |
| ISO with `Z` | UTC |
| ISO with offset | That offset, then stored UTC |
| Date-only `YYYY-MM-DD` | Midnight Asia/Kolkata |
| `DD/MM/YYYY [HH:MM:SS]` | Asia/Kolkata |
| Epoch milliseconds / seconds | UTC |

The UI displays dates and detail timestamps in **Asia/Kolkata**. Monthly analytics also bucket by Asia/Kolkata.

## Initial reward balance

`sum(coins_earned)` across seeded successful transactions, using the formula and cap above. This keeps the opening balance explainable from the dataset.

## Demo user

There is no authentication. A single seeded wallet (`id=1`) represents the demo customer.

## Reward catalogue

Six active rewards: cashback, Swiggy, Amazon, BookMyShow, IndiGo credit, and an expensive International Travel Pack (500,000 coins) so insufficient-balance UX can be demonstrated without draining the wallet first.

## Duplicate transaction IDs

The supplied file contains 10,000 rows but 40 duplicated IDs (9,960 unique). The first occurrence is kept; later duplicates are skipped and reported in the seed summary. Identity of the kept row is unchanged.

## Dataset outliers

`TXN2025006262` has amount `999999999.00`. This is stored unchanged. It is why Groceries appears as ~94% of successful spend.

## Mobile table behavior

Below the `md` breakpoint the table becomes stacked payment cards. Desktop keeps a sticky-header table. This avoids awkward horizontal scrolling on a consumer phone layout.
