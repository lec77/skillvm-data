---
name: clinical-nlp
description: Extract structured medical entities from clinical text and reconcile medication lists. Use when parsing clinical notes, discharge summaries, or medication lists into structured JSON.
---

# Clinical NLP Entity Extraction & Medication Reconciliation

## Entity Types

| Type | Description | Key Fields |
|------|-------------|------------|
| `condition` | Diagnoses, symptoms | `text`, `type`, `negated`, `section` |
| `medication` | Drugs with attributes | + `name`, `dose` (number), `unit`, `route`, `frequency` |
| `lab_result` | Lab tests with values | + `name`, `value` (number), `unit` |
| `vital_sign` | Vital measurements | + `name`, `value` (number), `unit` |
| `procedure` | Medical actions/tests | `text`, `type`, `negated`, `section` |

## Entity Extraction Output

Write `entities.json` as a JSON array. Each entity object:

```json
{"text": "type 2 diabetes mellitus", "type": "condition", "negated": false, "section": "HPI"}
```

Medication entities add parsed fields:
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "section": "MEDICATIONS", "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

Lab result entities add parsed fields:
```json
{"text": "Creatinine 1.3 mg/dL", "type": "lab_result", "negated": false, "section": "LABORATORY RESULTS", "name": "Creatinine", "value": 1.3, "unit": "mg/dL"}
```

**Critical rules:**
- `negated` must be boolean `true`/`false`, never a string
- `dose` and `value` must be numbers, never strings
- Extract ALL entities from every section of the note

## Negation Detection

Set `negated: true` when any of these phrases precede the entity in the same clause:
- `no`, `not`, `none`, `without`, `denies`, `denied`
- `negative for`, `no evidence of`, `no history of`, `no prior history of`
- `ruled out`, `rules out`, `rule out`, `absent`, `free of`

Examples: "denies nausea" -> nausea negated=true; "denies nausea or vomiting" -> BOTH nausea AND vomiting are negated=true; "No evidence of heart failure" -> heart failure negated=true; "no prior history of coronary artery disease" -> CAD negated=true.

Scope: negation applies within the same clause (ends at period/semicolon). "or" extends negation scope: "denies X or Y" negates both X and Y.

## Section Detection

Identify sections by scanning for headers (lines ending with `:`, all-caps labels, or numbered headers):
`CHIEF COMPLAINT`, `HPI`, `PAST MEDICAL HISTORY`/`PMH`, `MEDICATIONS`, `ALLERGIES`, `VITAL SIGNS`, `PHYSICAL EXAM`, `LABORATORY RESULTS`/`LABS`, `IMAGING`, `ASSESSMENT AND PLAN`

## Medication Reconciliation Output

Write `reconciliation.json` with this exact structure:

```json
{
  "admission_meds": [{"name": "DrugName", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"}],
  "discharge_meds": [{"name": "DrugName", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}],
  "changes": {
    "continued": [{"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}],
    "increased": [{"name": "Metformin", "admission_dose": 500, "discharge_dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}],
    "discontinued": [{"name": "Omeprazole", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"}],
    "new_meds": [{"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"}],
    "switched": [{"from_name": "Simvastatin", "to_name": "Atorvastatin", "drug_class": "statins"}]
  }
}
```

**Change categories:**
- **continued**: same drug name AND same dose
- **increased**: same drug name, higher dose at discharge
- **decreased**: same drug name, lower dose at discharge
- **discontinued**: in admission list but not in discharge list
- **new_meds**: in discharge list but not in admission list
- **switched**: different drug name but same drug class

**Drug class groupings for switch detection:**
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan, irbesartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole
- SSRIs: sertraline, fluoxetine, escitalopram

## Common Abbreviations

Routes: `PO` (oral), `IV`, `IM`, `SQ`/`SC` (subcutaneous), `SL` (sublingual), `INH` (inhaled)
Frequencies: `QD`/`daily`, `BID` (2x/day), `TID` (3x/day), `QID` (4x/day), `QHS` (bedtime), `PRN` (as needed)
