---
name: clinical-nlp
description: Extract structured medical entities from clinical text and perform medication reconciliation. Use when parsing clinical notes, discharge summaries, or comparing medication lists.
---

# Clinical NLP Entity Extraction & Medication Reconciliation

## Task 1: Entity Extraction from Clinical Notes

Read the clinical note and extract ALL medical entities into a JSON array. Write the result as `entities.json`.

### Entity Types

| Type | Examples |
|------|---------|
| `condition` | diagnoses, diseases, symptoms (diabetes, chest pain, hypertension) |
| `medication` | drugs with dose/route/frequency (Metformin 1000mg PO BID) |
| `lab_result` | lab tests with numeric values (Troponin I: 0.04 ng/mL) |
| `vital_sign` | vital measurements (BP 158/92 mmHg, HR 88 bpm) |
| `procedure` | medical actions (serial troponins, continuous monitoring) |

### Output Format for entities.json

Write a JSON array directly (not wrapped in an object). Each entity:

```json
{
  "text": "exact text from note",
  "type": "condition|medication|lab_result|vital_sign|procedure",
  "negated": false,
  "section": "SECTION NAME"
}
```

**Medication** entities add: `"name"`, `"dose"` (number), `"unit"`, `"route"`, `"frequency"`
**Lab result** entities add: `"name"`, `"value"` (number), `"unit"`

### Negation Detection (CRITICAL)

These phrases mark the FOLLOWING entity as `"negated": true`:
- "denies", "denies any" → e.g., "denies any nausea or vomiting" → nausea AND vomiting are negated
- "no", "no prior history of", "no history of" → e.g., "No prior history of coronary artery disease" → CAD is negated
- "no evidence of" → e.g., "No evidence of heart failure" → heart failure is negated
- "without", "negative for", "ruled out", "absent"

Negation scope: applies within the same clause (until period or semicolon). "denies any X or Y" negates BOTH X and Y.

### Section Headers

Detect sections by ALL-CAPS headers or lines ending with colon: CHIEF COMPLAINT, HISTORY OF PRESENT ILLNESS, MEDICATIONS, VITAL SIGNS, LABORATORY RESULTS, ASSESSMENT AND PLAN, etc.

### Extraction Checklist

- Extract ALL conditions mentioned anywhere in the note (including Assessment section)
- Extract ALL medications with numeric dose, unit, route, frequency
- Extract ALL lab values with numeric value and unit
- Extract ALL vital signs
- Extract ALL procedures
- Mark negated entities correctly — check every "denies", "no", "no evidence of" phrase
- Ensure `"dose"` and `"value"` fields are numbers, not strings
- Ensure `"negated"` is boolean `true`/`false`, not a string

---

## Task 2: Medication Reconciliation

Compare admission and discharge medication lists. Write `reconciliation.json`.

### Output Format for reconciliation.json

```json
{
  "admission_meds": [ ...array of medication objects... ],
  "discharge_meds": [ ...array of medication objects... ],
  "changes": {
    "continued": [ ...medications with same drug AND same dose... ],
    "increased": [ ...medications with same drug but HIGHER dose at discharge... ],
    "decreased": [ ...medications with same drug but LOWER dose at discharge... ],
    "discontinued": [ ...medications in admission but NOT in discharge (and not switched)... ],
    "new_meds": [ ...medications in discharge but NOT in admission (and not switched)... ],
    "switched": [ ...different drug in same therapeutic class... ]
  }
}
```

### Medication Object Format

Each medication in `admission_meds` and `discharge_meds` arrays:

```json
{
  "name": "DrugName",
  "dose": 500,
  "unit": "mg",
  "route": "PO",
  "frequency": "BID"
}
```

### CRITICAL: Count Requirements

- `admission_meds` array must contain EXACTLY the number of medications listed in the admission file
- `discharge_meds` array must contain EXACTLY the number of medications listed in the discharge file
- Parse EVERY medication from BOTH files — do not skip any

### Change Classification Rules

1. **continued**: Same drug name, same dose on both lists
2. **increased**: Same drug name, higher dose at discharge
3. **decreased**: Same drug name, lower dose at discharge
4. **discontinued**: Drug present on admission, absent at discharge, AND not switched to same-class drug
5. **new_meds**: Drug present at discharge, absent on admission, AND not switched from same-class drug
6. **switched**: Different drug names but same therapeutic class (detect class switches)

### Drug Class Groups for Switch Detection

- **Statins**: atorvastatin, simvastatin, rosuvastatin, pravastatin
- **ACE inhibitors**: lisinopril, enalapril, ramipril
- **ARBs**: losartan, valsartan, irbesartan
- **Beta-blockers**: metoprolol, carvedilol, atenolol
- **PPIs**: omeprazole, pantoprazole, esomeprazole

### Switch Format

```json
{
  "from": { "name": "OldDrug", "dose": 20, "unit": "mg", "route": "PO", "frequency": "QHS" },
  "to": { "name": "NewDrug", "dose": 40, "unit": "mg", "route": "PO", "frequency": "QHS" },
  "class": "statins"
}
```

When a switch is detected, the old drug goes ONLY in `switched` (not in `discontinued`) and the new drug goes ONLY in `switched` (not in `new_meds`).

### Reconciliation Checklist

- Count admission meds carefully — the array length must match the source file
- Count discharge meds carefully — the array length must match the source file
- Check every pair of drugs for class membership before classifying as discontinued/new
- Use exact key names: `admission_meds`, `discharge_meds`, `changes`, `continued`, `increased`, `decreased`, `discontinued`, `new_meds`, `switched`
