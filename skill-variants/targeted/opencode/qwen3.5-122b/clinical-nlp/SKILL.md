---
name: clinical-nlp
description: Extract structured medical entities from clinical text and perform medication reconciliation. Use when parsing clinical notes or comparing medication lists.
---

# Clinical NLP Entity Extraction

## Entity Types

| Type | Description | Example |
|------|-------------|---------|
| `condition` | Diagnoses, diseases, symptoms | "type 2 diabetes mellitus", "chest pain" |
| `medication` | Drug names with dose/route/frequency | "Metformin 500mg PO BID" |
| `lab_result` | Lab test with numeric value and unit | "Creatinine 1.3 mg/dL" |
| `vital_sign` | Vital measurements | "BP 158/92 mmHg" |
| `procedure` | Medical actions or tests | "serial troponins" |

## Entity Extraction Output

Write output as a JSON array directly using the write/edit tool. Do NOT use Python scripts.

Each entity object:
```json
{"text": "type 2 diabetes mellitus", "type": "condition", "negated": false, "section": "HPI"}
```

Medication entities add: `name`, `dose` (number), `unit`, `route`, `frequency`:
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "section": "MEDICATIONS", "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

Lab result entities add: `name`, `value` (number), `unit`:
```json
{"text": "Creatinine: 1.3 mg/dL", "type": "lab_result", "negated": false, "section": "LABORATORY RESULTS", "name": "Creatinine", "value": 1.3, "unit": "mg/dL"}
```

## Negation Detection

These phrases negate the entity that follows within the same clause:
- `no`, `not`, `denies`, `denied`, `without`
- `no evidence of`, `no history of`, `no prior history of`
- `ruled out`, `negative for`, `absent`

Examples:
- "denies any nausea or vomiting" → nausea negated=true, vomiting negated=true
- "No prior history of coronary artery disease" → CAD negated=true
- "No evidence of heart failure" → heart failure negated=true
- "Patient has hypertension" → hypertension negated=false

The word "or" extends negation: "denies X or Y" → both X and Y are negated.

## Section Detection

Identify sections by scanning for headers (all-caps lines or lines ending with `:`):
`CHIEF COMPLAINT`, `HISTORY OF PRESENT ILLNESS`/`HPI`, `MEDICATIONS`, `VITAL SIGNS`, `LABORATORY RESULTS`/`LABS`, `ASSESSMENT AND PLAN`, `DISCHARGE MEDICATIONS`

## Medication Reconciliation

When comparing admission vs discharge medication lists, write `reconciliation.json` directly using the write tool with this exact structure:

```json
{
  "admission_meds": [
    {"name": "Metformin", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}
  ],
  "discharge_meds": [
    {"name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"},
    {"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"}
  ],
  "changes": {
    "continued": [
      {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "increased": [
      {"name": "Metformin", "from_dose": 500, "to_dose": 1000, "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
    ],
    "decreased": [],
    "discontinued": [
      {"name": "Omeprazole", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "new_meds": [
      {"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "switched": [
      {"name": "Simvastatin", "switched_to": "Atorvastatin", "drug_class": "statin", "from_dose": 20, "to_dose": 40}
    ]
  }
}
```

CRITICAL format rules:
- Each item in `continued`, `increased`, `decreased`, `discontinued`, `new_meds`, `switched` must be a FLAT object with a `name` field at the top level
- `dose` must be a number, not a string
- Do NOT nest objects under `admission`/`discharge` sub-keys
- The `switched` array items must include both drug names (use `name` for the old drug, `switched_to` for the new drug)

### Change Classification

- **continued**: same drug, same dose in both lists
- **increased**: same drug, higher dose at discharge
- **decreased**: same drug, lower dose at discharge
- **discontinued**: in admission only, not in discharge (and no same-class substitute)
- **new_meds**: in discharge only, not in admission (and not a same-class substitute)
- **switched**: different drug but same therapeutic class replaced the old one

### Drug Class Groups (for switch detection)

- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin, lovastatin
- ACE inhibitors: lisinopril, enalapril, ramipril, captopril
- ARBs: losartan, valsartan, irbesartan, olmesartan
- PPIs: omeprazole, pantoprazole, esomeprazole, lansoprazole
- Beta-blockers: metoprolol, carvedilol, atenolol, bisoprolol
- Sulfonylureas: glipizide, glyburide, glimepiride

### Common Medications

Metformin (biguanide), Lisinopril (ACE-I), Atorvastatin/Simvastatin (statin), Aspirin (antiplatelet), Omeprazole (PPI), Furosemide (loop diuretic), Glipizide (sulfonylurea), Amlodipine (CCB), Metoprolol (beta-blocker)

## Medication Parsing Pattern

Parse: `DrugName DoseUnit Route Frequency`
- Route: PO, IV, IM, SQ, SL, TOP, INH
- Frequency: daily/QD, BID, TID, QID, QHS, PRN, Q4H/Q6H/Q8H
- Strip parenthetical annotations like "(increased from 500mg)" or "(new)" before parsing

## Vital Sign Patterns

- BP: `BP systolic/diastolic mmHg`
- HR: `HR value bpm`
- RR: `RR value`
- SpO2: `SpO2 value%`
- Temp: `Temp value°F` or `value°C`
