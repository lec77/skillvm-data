---
name: clinical-nlp
description: Extract structured medical entities from clinical text and reconcile medication lists. Use when parsing clinical notes or comparing admission/discharge medications.
---

# Clinical NLP Entity Extraction & Medication Reconciliation

## Entity Types

| Type | Description | Example |
|------|-------------|---------|
| `condition` | Diagnoses, diseases, symptoms | "type 2 diabetes mellitus", "chest pain" |
| `medication` | Drug names with dose/route/frequency | "Metformin 500mg PO BID" |
| `lab_result` | Lab test with numeric value and unit | "Creatinine 1.3 mg/dL" |
| `vital_sign` | Vital measurements | "BP 158/92 mmHg", "HR 88 bpm" |
| `procedure` | Medical actions or tests | "serial troponins" |

## Entity Extraction Output

Write output as a JSON array to `entities.json`. Each entity is an object:

```json
[
  {
    "text": "type 2 diabetes mellitus",
    "type": "condition",
    "negated": false,
    "section": "HPI"
  },
  {
    "text": "Metformin 1000mg PO BID",
    "type": "medication",
    "negated": false,
    "section": "MEDICATIONS",
    "name": "Metformin",
    "dose": 1000,
    "unit": "mg",
    "route": "PO",
    "frequency": "BID"
  },
  {
    "text": "Creatinine 1.3 mg/dL",
    "type": "lab_result",
    "negated": false,
    "section": "LABORATORY RESULTS",
    "name": "Creatinine",
    "value": 1.3,
    "unit": "mg/dL"
  }
]
```

**IMPORTANT**: `dose` and `value` must be numbers, not strings. `negated` must be boolean.

Extract **at least 15 entities** from a typical clinical note including all conditions, medications, labs, vitals, and procedures.

## Negation Detection

These phrases negate the entity that follows them in the same clause:
- `no`, `not`, `none`, `without`, `denies`, `denied`, `denying`
- `negative for`, `no evidence of`, `no history of`, `no prior history of`
- `ruled out`, `absent`, `free of`

Examples:
- "denies nausea" → nausea: `negated: true`
- "denies nausea and vomiting" → both nausea AND vomiting: `negated: true`
- "no prior history of coronary artery disease" → CAD: `negated: true`
- "No evidence of heart failure" → heart failure: `negated: true`
- "Patient has hypertension" → hypertension: `negated: false`

**Scope**: Negation applies to ALL conditions listed after the trigger in the same clause/sentence, including items joined by "and"/"or". A period or semicolon ends negation scope.

## Section Detection

Identify section headers (lines ending with `:` or all-caps labels):
`CHIEF COMPLAINT`, `HPI`, `PAST MEDICAL HISTORY`/`PMH`, `MEDICATIONS`, `ALLERGIES`, `VITAL SIGNS`, `PHYSICAL EXAM`, `LABORATORY RESULTS`/`LABS`, `IMAGING`, `ASSESSMENT AND PLAN`, `DISCHARGE MEDICATIONS`

## Medication Reconciliation

When comparing admission and discharge medication lists, write `reconciliation.json`.

**IMPORTANT**: Parse ALL medications from BOTH input files. The `admission_meds` array must contain EVERY medication from the admission file, and `discharge_meds` must contain EVERY medication from the discharge file. Do NOT use example data — read the actual files.

Output structure (using placeholder names — replace with actual data from files):

```json
{
  "admission_meds": [
    {"name": "DrugA", "dose": 100, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "DrugB", "dose": 50, "unit": "mg", "route": "PO", "frequency": "daily"}
  ],
  "discharge_meds": [
    {"name": "DrugA", "dose": 200, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "DrugC", "dose": 10, "unit": "mg", "route": "PO", "frequency": "daily"}
  ],
  "changes": {
    "continued": [
      {"name": "DrugX", "dose": 81, "unit": "mg"}
    ],
    "increased": [
      {"name": "DrugA", "from_dose": 100, "to_dose": 200, "unit": "mg"}
    ],
    "decreased": [],
    "discontinued": [
      {"name": "DrugB", "dose": 50, "unit": "mg"}
    ],
    "new_meds": [
      {"name": "DrugC", "dose": 10, "unit": "mg"}
    ],
    "switched": [
      {"name": "OldDrug", "switched_to": "NewDrug", "drug_class": "class_name"}
    ]
  }
}
```

**CRITICAL rules**:
1. Every item in the `changes` arrays MUST be an **object** with at minimum a `name` field. Never use plain strings.
2. Include ALL medications from both input files in `admission_meds` and `discharge_meds` — do not omit any.

### Change Categories

- **continued**: Same drug, same dose on both lists
- **increased**: Same drug, higher dose at discharge
- **decreased**: Same drug, lower dose at discharge
- **discontinued**: Present on admission, absent at discharge
- **new_meds**: Absent on admission, present at discharge
- **switched**: Different drug but same drug class (e.g., Simvastatin → Atorvastatin, both statins)

### Drug Class Groupings for Switch Detection

- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan, irbesartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole
- SSRIs: sertraline, fluoxetine, escitalopram

### Route & Frequency Abbreviations

Routes: `PO` (oral), `IV` (intravenous), `IM` (intramuscular), `SQ`/`SC` (subcutaneous), `SL` (sublingual), `INH` (inhaled)

Frequencies: `QD`/`daily` (once daily), `BID` (twice daily), `TID` (three times daily), `QID` (four times daily), `QHS` (at bedtime), `PRN` (as needed), `Q4H`/`Q6H`/`Q8H` (every N hours)
