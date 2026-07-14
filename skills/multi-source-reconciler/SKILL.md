---
name: multi-source-reconciler
description: Extract from four heterogeneous data sources, then reconcile them into one report
---

## When to Use

Use this skill to reconcile order data that arrives in four different formats —
a CSV of orders, a JSON event stream, a fixed-width ledger, and an XML inventory
feed — into a single reconciliation report.

## Why the Extractions Are Independent

Each source is a different format and needs a different parser. None of the four
extractions reads another's output, so they are independent instructions: they
can be issued together and run at the same time. Only the final reconciliation
depends on all four.

## Workflow

### Step 1 — Parse the CSV orders

```bash
python3 tools/parse_orders_csv.py sources/orders.csv orders_parsed.json
```

### Step 2 — Roll up the JSON event stream

```bash
python3 tools/rollup_events_json.py sources/events.json events_rollup.json
```

### Step 3 — Decode the fixed-width ledger

```bash
python3 tools/decode_ledger.py sources/ledger.dat ledger_decoded.json
```

### Step 4 — Tally the XML inventory

```bash
python3 tools/tally_inventory_xml.py sources/inventory.xml inventory_tally.json
```

Steps 1–4 are independent — each reads its own source file and writes its own
output file, and none consumes another's result. They may run in any order or
concurrently.

### Step 5 — Reconcile

Once all four extracts exist, merge them:

```bash
python3 tools/reconcile.py
```

This reads `orders_parsed.json`, `events_rollup.json`, `ledger_decoded.json`, and
`inventory_tally.json` and writes `reconciliation.json`.
