---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Use for parsing clinical notes, discharge summaries, or reconciling medication lists.
---

# Clinical NLP Entity Extraction

Extract medical entities from clinical text into JSON arrays. Write output directly as a JSON file.

## Entity Types

Five types: `condition`, `medication`, `lab_result`, `vital_sign`, `procedure`

## Output Schema

Every entity MUST have: `text` (string), `type` (string), `negated` (boolean - true/false, NOT a string)

Medications MUST also have: `name` (string), `dose` (number, NOT string), `unit` (string), `route` (string), `frequency` (string)

Lab results MUST also have: `name` (string), `value` (number, NOT string), `unit` (string)

### Examples

```json
[
  {"text": "type 2 diabetes mellitus", "type": "condition", "negated": false},
  {"text": "denies nausea", "type": "condition", "negated": true},
  {"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"},
  {"text": "Troponin I 0.04 ng/mL", "type": "lab_result", "negated": false, "name": "Troponin I", "value": 0.04, "unit": "ng/mL"},
  {"text": "BP 158/92 mmHg", "type": "vital_sign", "negated": false},
  {"text": "serial troponins", "type": "procedure", "negated": false}
]
```

## CRITICAL: Negation Detection

Set `negated: true` when text BEFORE the entity (in the same sentence) contains any of these triggers:
- "denies", "denied", "denying"
- "no", "not", "none", "without"
- "no evidence of", "no history of", "no prior history of"
- "negative for", "ruled out", "absent"

Examples from clinical notes:
- "denies nausea and vomiting" → nausea: negated=true, vomiting: negated=true
- "no prior history of coronary artery disease" → coronary artery disease: negated=true
- "No evidence of heart failure" → heart failure: negated=true
- "Patient has hypertension" → hypertension: negated=false (no trigger word)
- "History of T2DM" → diabetes: negated=false

A period or semicolon ends the negation scope. Only check within the same clause.

## Medication Reconciliation

When comparing admission vs discharge medication lists, output JSON with this exact structure:

```json
{
  "admission_meds": [{"name": "DrugName", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"}],
  "discharge_meds": [{"name": "DrugName", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}],
  "changes": {
    "continued": [],
    "increased": [],
    "discontinued": [],
    "new_meds": [],
    "switched": []
  }
}
```

Classification rules:
- **continued**: same drug, same dose in both lists
- **increased**: same drug, higher dose at discharge
- **decreased**: same drug, lower dose at discharge
- **discontinued**: on admission only (not switched)
- **new_meds**: on discharge only (not switched)
- **switched**: different drug name but SAME drug class — do NOT also list in discontinued/new_meds

Drug classes for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan, irbesartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole
- SSRIs: sertraline, fluoxetine, escitalopram

Each entry in changes arrays should include the medication `name` and `dose` fields at minimum.

## Validation Checklist

1. `negated` must be boolean (true/false), never a string
2. `dose` and `value` must be numbers, never strings
3. `type` must be exactly one of: condition, medication, lab_result, vital_sign, procedure
4. Extract ALL entities — aim for 15+ from a typical clinical note
5. Write valid JSON — no trailing commas, no comments
