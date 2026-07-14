---
name: clinical-nlp
description: Extract structured medical entities from clinical text. Use when parsing clinical notes, discharge summaries, or medication lists into structured JSON.
---

# Clinical NLP Entity Extraction

## Entity Types

- `condition` — diagnoses, diseases, symptoms (e.g. "type 2 diabetes mellitus", "chest pain")
- `medication` — drugs with dose/route/frequency (e.g. "Metformin 500mg PO BID")
- `lab_result` — lab tests with numeric value and unit (e.g. "Creatinine 1.3 mg/dL")
- `vital_sign` — vital measurements (e.g. "BP 158/92 mmHg", "HR 88 bpm")
- `procedure` — medical actions or tests (e.g. "serial troponins")

## Entity Extraction Output

Write `entities.json` as a JSON array. Each entity object:

```json
{"text": "type 2 diabetes mellitus", "type": "condition", "negated": false, "section": "HPI"}
```

Medications MUST include extra fields:
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "section": "MEDICATIONS", "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

Lab results MUST include extra fields:
```json
{"text": "Troponin I: 0.04 ng/mL", "type": "lab_result", "negated": false, "section": "LABORATORY RESULTS", "name": "Troponin I", "value": 0.04, "unit": "ng/mL"}
```

IMPORTANT: `dose` and `value` must be numbers (not strings). `negated` must be boolean.

## Negation Detection

These phrases negate the entity that follows them in the same clause:
- "no", "not", "denies", "denied", "without"
- "no evidence of", "no history of", "no prior history of"
- "negative for", "ruled out", "absent"

Examples: "denies nausea" → nausea negated=true. "no prior history of coronary artery disease" → CAD negated=true. "No evidence of heart failure" → heart failure negated=true. "denies any nausea or vomiting" → nausea negated=true AND vomiting negated=true.

## Section Detection

Identify sections by headers (lines ending with `:` or all-caps): CHIEF COMPLAINT, HISTORY OF PRESENT ILLNESS/HPI, PAST MEDICAL HISTORY/PMH, MEDICATIONS, VITAL SIGNS, LABORATORY RESULTS/LABS, ASSESSMENT AND PLAN, DISCHARGE MEDICATIONS.

## Medication Reconciliation

When comparing admission vs discharge medication lists, write `reconciliation.json` with this EXACT structure:

```json
{
  "admission_meds": [
    {"name": "Metformin", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"}
  ],
  "discharge_meds": [
    {"name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
  ],
  "changes": {
    "continued": [{"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}],
    "increased": [{"name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}],
    "discontinued": [{"name": "Omeprazole", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"}],
    "new_meds": [{"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"}],
    "switched": [{"from": {"name": "Simvastatin", "dose": 20}, "to": {"name": "Atorvastatin", "dose": 40}, "class": "Statins"}]
  }
}
```

CRITICAL: Every item in `continued`, `increased`, `discontinued`, and `new_meds` arrays MUST be a medication object with at least a `name` field (string). Do NOT use plain strings.

### Classification Rules

- **continued**: same drug name AND same dose in both lists
- **increased**: same drug name, higher dose at discharge
- **discontinued**: in admission list but not in discharge list (by drug name)
- **new_meds**: in discharge list but not in admission list (by drug name)
- **switched**: different drug name but same drug class (one discontinued, one new)

### Drug Classes for Switch Detection

- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan, irbesartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole

## Medication Parsing Pattern

Format: `DrugName DOSEunit ROUTE FREQUENCY`
- Routes: PO (oral), IV, IM, SQ/SC, SL, TOP, INH
- Frequencies: daily/QD, BID, TID, QID, QHS, PRN, Q4H/Q6H/Q8H
