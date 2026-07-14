---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Use when parsing clinical notes, medication lists, or discharge summaries.
---

# Clinical NLP Entity Extraction

Extract medical entities from unstructured clinical text into structured JSON.

## Entity Types

Five types: `condition`, `medication`, `lab_result`, `vital_sign`, `procedure`.

## Output: entities.json

Write a JSON **array** of entity objects to `entities.json`. The file must contain a top-level array `[...]`, not an object.

### Required fields for ALL entities

```json
{
  "text": "exact text from note",
  "type": "condition|medication|lab_result|vital_sign|procedure",
  "negated": false,
  "section": "section header where found"
}
```

### Additional fields by type

**medication** — add: `name` (string), `dose` (number), `unit` (string), `route` (string), `frequency` (string)

**lab_result** — add: `name` (string), `value` (number), `unit` (string)

### Critical rules
- `negated` must be boolean (`true`/`false`), never a string
- `dose` and `value` must be numbers, never strings (write `81` not `"81"`)
- Extract ALL entities: conditions, symptoms, medications, labs, vitals, procedures
- Target: at least 15+ entities from a typical clinical note

## Negation Detection

These phrases make the following entity `negated: true`:
- "denies", "denied", "denying" — e.g., "Denies any nausea or vomiting" → nausea negated=true, vomiting negated=true
- "no", "no evidence of", "no history of", "no prior history of" — e.g., "No prior history of coronary artery disease" → CAD negated=true
- "without", "negative for", "ruled out", "absent"

**Scope**: negation applies to ALL conditions in the same clause until a period or semicolon. "Denies any nausea or vomiting" negates BOTH nausea AND vomiting.

## Section Headers

Map text to sections: CHIEF COMPLAINT, HPI (History of Present Illness), PAST MEDICAL HISTORY, MEDICATIONS, VITAL SIGNS, LABORATORY RESULTS, ASSESSMENT AND PLAN, DISCHARGE MEDICATIONS.

## Medication Parsing

Pattern: `DrugName DoseNumber Unit Route Frequency`
- Routes: PO, IV, IM, SQ, SC, SL, TOP, INH
- Frequencies: QD/daily, BID, TID, QID, QHS, PRN, Q4H/Q6H/Q8H

Example: "Metformin 1000mg PO BID" → `{"name":"Metformin","dose":1000,"unit":"mg","route":"PO","frequency":"BID"}`

## Lab Value Parsing

Pattern: `AnalyteName: Value Unit`

Example: "Troponin I: 0.04 ng/mL" → `{"name":"Troponin I","value":0.04,"unit":"ng/mL"}`

## Common Conditions

type 2 diabetes mellitus, hypertension, chest pain, shortness of breath, heart failure, coronary artery disease, nausea, vomiting, COPD, atrial fibrillation, pneumonia, ACS

---

# Medication Reconciliation

When comparing admission vs discharge medication lists, write `reconciliation.json` with this EXACT structure:

```json
{
  "admission_meds": [
    {"name": "DrugName", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"}
  ],
  "discharge_meds": [
    {"name": "DrugName", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
  ],
  "changes": {
    "continued": [],
    "increased": [],
    "discontinued": [],
    "new_meds": [],
    "switched": []
  }
}
```

### CRITICAL: Field names must be exactly `admission_meds`, `discharge_meds`, and `changes`

### Change categories

| Category | Rule | Example |
|----------|------|---------|
| `continued` | Same drug, same dose | Aspirin 81mg on both lists |
| `increased` | Same drug, higher dose at discharge | Metformin 500mg→1000mg |
| `discontinued` | On admission, absent at discharge | Omeprazole removed |
| `new_meds` | Absent on admission, present at discharge | Glipizide added |
| `switched` | Different drug, same drug class | Simvastatin→Atorvastatin (both statins) |

### Drug classes for switch detection
- **Statins**: atorvastatin, simvastatin, rosuvastatin, pravastatin
- **ACE inhibitors**: lisinopril, enalapril, ramipril, captopril
- **ARBs**: losartan, valsartan, irbesartan
- **Beta-blockers**: metoprolol, carvedilol, atenolol
- **PPIs**: omeprazole, pantoprazole, esomeprazole

### Medication counts matter
- `admission_meds` array length must match the exact number of medications in the admission list
- `discharge_meds` array length must match the exact number of medications in the discharge list
- Parse ONLY the listed medications, do not add or omit any

### Each entry in changes arrays

For `continued`: `{"name":"Aspirin","dose":81,"unit":"mg","route":"PO","frequency":"daily"}`

For `increased`: `{"name":"Metformin","admission_dose":500,"discharge_dose":1000,"unit":"mg","route":"PO","frequency":"BID"}`

For `discontinued`: `{"name":"Omeprazole","dose":20,"unit":"mg","route":"PO","frequency":"daily"}`

For `new_meds`: `{"name":"Glipizide","dose":5,"unit":"mg","route":"PO","frequency":"daily"}`

For `switched`: `{"from_drug":"Simvastatin","to_drug":"Atorvastatin","class":"statin","admission_dose":20,"discharge_dose":40,"unit":"mg"}`
