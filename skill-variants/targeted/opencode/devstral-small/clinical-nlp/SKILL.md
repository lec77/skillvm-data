---
name: clinical-nlp
description: Extract structured medical entities from clinical text and perform medication reconciliation. Use when parsing clinical notes or comparing medication lists.
---

# Clinical NLP

## Task 1: Entity Extraction from Clinical Notes

Read a clinical note and extract every medical entity into a JSON array. Write the output to `entities.json`.

### Entity Types

- `condition`: diagnoses, diseases, symptoms (diabetes, hypertension, chest pain, nausea, vomiting, coronary artery disease, heart failure, shortness of breath)
- `medication`: drugs with dosing (Metformin 1000mg PO BID)
- `lab_result`: lab tests with numeric results (Troponin I: 0.04 ng/mL)
- `vital_sign`: vital measurements (BP 158/92 mmHg, HR 88 bpm)
- `procedure`: medical actions (serial troponins, continuous monitoring)

### Negation Detection

If any of these phrases appear BEFORE an entity in the same sentence, set `negated: true`:
- "denies", "denied", "denying"
- "no", "no evidence of", "no history of", "no prior history of"
- "without", "negative for", "ruled out", "absent"

Examples:
- "denies nausea" → nausea: negated=true
- "denies any nausea or vomiting" → nausea: negated=true, vomiting: negated=true
- "No prior history of coronary artery disease" → coronary artery disease: negated=true
- "No evidence of heart failure" → heart failure: negated=true
- "Patient has hypertension" → hypertension: negated=false

### Section Headers

Track the current section as you read each line. Sections are identified by lines like "CHIEF COMPLAINT:", "HISTORY OF PRESENT ILLNESS:", "MEDICATIONS:", "VITAL SIGNS:", "LABORATORY RESULTS:", "ASSESSMENT AND PLAN:", etc.

### Output Format for entities.json

Write a JSON array. Each entity object MUST have these fields:
- `text`: exact text from the note
- `type`: one of condition, medication, lab_result, vital_sign, procedure
- `negated`: boolean (true or false, NOT a string)

For medications, also include:
- `name`: drug name (string)
- `dose`: numeric dose (NUMBER, not string)
- `unit`: "mg", "mcg", etc.
- `route`: "PO", "IV", etc.
- `frequency`: "BID", "daily", "QHS", etc.

For lab results, also include:
- `name`: test name (string)
- `value`: numeric result (NUMBER, not string)
- `unit`: "ng/mL", "mg/dL", "%", etc.

Example output:
```json
[
  {"text": "type 2 diabetes mellitus", "type": "condition", "negated": false, "section": "HPI"},
  {"text": "nausea", "type": "condition", "negated": true, "section": "HPI"},
  {"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "section": "MEDICATIONS", "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"},
  {"text": "Troponin I: 0.04 ng/mL", "type": "lab_result", "negated": false, "section": "LABORATORY RESULTS", "name": "Troponin I", "value": 0.04, "unit": "ng/mL"},
  {"text": "BP 158/92 mmHg", "type": "vital_sign", "negated": false, "section": "VITAL SIGNS"}
]
```

Extract at least 15 entities from a typical clinical note.

## Task 2: Medication Reconciliation

Compare admission and discharge medication lists. Write `reconciliation.json`.

### Steps

1. Parse each medication: name, dose (number), unit, route, frequency
2. Match medications by drug name (case-insensitive)
3. Classify each medication into exactly ONE category:
   - **continued**: same drug, same dose on both lists
   - **increased**: same drug, higher dose at discharge
   - **decreased**: same drug, lower dose at discharge
   - **discontinued**: on admission list ONLY (and NOT part of a drug class switch)
   - **new_meds**: on discharge list ONLY (and NOT part of a drug class switch)
   - **switched**: one drug discontinued and replaced by a different drug in the SAME class

IMPORTANT: Each medication goes in exactly ONE category. If two drugs are a class switch (e.g., Simvastatin→Atorvastatin), put them in `switched`, NOT in discontinued/new_meds.

### Drug Classes for Switch Detection

- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan, irbesartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole

### Output Format for reconciliation.json

```json
{
  "admission_meds": [
    {"name": "Metformin", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "Lisinopril", "dose": 10, "unit": "mg", "route": "PO", "frequency": "daily"},
    {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"},
    {"name": "Omeprazole", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"},
    {"name": "Simvastatin", "dose": 20, "unit": "mg", "route": "PO", "frequency": "QHS"}
  ],
  "discharge_meds": [
    {"name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "Lisinopril", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"},
    {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"},
    {"name": "Atorvastatin", "dose": 40, "unit": "mg", "route": "PO", "frequency": "QHS"},
    {"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"},
    {"name": "Furosemide", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"}
  ],
  "changes": {
    "continued": [
      {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "increased": [
      {"name": "Metformin", "from_dose": 500, "to_dose": 1000, "unit": "mg"},
      {"name": "Lisinopril", "from_dose": 10, "to_dose": 20, "unit": "mg"}
    ],
    "discontinued": [
      {"name": "Omeprazole", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "new_meds": [
      {"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"},
      {"name": "Furosemide", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "switched": [
      {"from": "Simvastatin", "to": "Atorvastatin", "class": "statin"}
    ]
  }
}
```
