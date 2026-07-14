---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Use for parsing clinical notes, medication lists, and discharge summaries.
---

# Clinical NLP

## Entity Extraction

Extract entities from clinical notes into JSON arrays. Each entity needs: `text`, `type`, `negated` (boolean).

**Types:** `condition`, `medication`, `lab_result`, `vital_sign`, `procedure`

**Medication fields:** `name`, `dose` (number), `unit`, `route`, `frequency`
**Lab result fields:** `name`, `value` (number), `unit`

### Negation

Set `negated: true` when preceded by: "denies", "no", "no evidence of", "no history of", "no prior history of", "without", "denied", "negative for", "ruled out", "absent". Scope ends at period/semicolon.

Examples: "denies nausea" → negated=true. "no evidence of heart failure" → negated=true. "has hypertension" → negated=false.

## Medication Reconciliation

Compare admission vs discharge medication lists. Parse each med: `name`, `dose` (number), `unit`, `route`, `frequency`.

Output `reconciliation.json` with keys:
- `admission_meds`: array of parsed meds
- `discharge_meds`: array of parsed meds
- `changes`: object with these arrays:
  - `continued`: same drug, same dose
  - `increased`: same drug, higher dose at discharge
  - `decreased`: same drug, lower dose at discharge
  - `discontinued`: in admission only
  - `new_meds`: in discharge only
  - `switched`: different drug but same class

**Drug classes for switch detection:**
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole

**IMPORTANT:** Each `changes` entry must have a `name` field with the drug name. For `switched`, include `from` and `to` drug names. Dose/value fields must be numbers, not strings. `negated` must be boolean.

## Quick approach

For entity extraction: read the note, manually identify each entity by scanning line by line, build JSON directly. Do NOT write complex regex-based Python scripts — just construct the JSON output directly by reading and understanding the text.

For medication reconciliation: read both files, parse each medication line, compare by drug name, classify changes, write JSON. Keep it simple — parse the structured medication lines directly.
