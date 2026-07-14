---
name: clinical-nlp
description: Extract structured medical entities from clinical text and reconcile medication lists. Outputs JSON files directly without scripts.
---

# Clinical NLP Entity Extraction

Extract structured medical entities from clinical text into JSON. Write output files directly — do NOT write scripts.

## Task 1: Entity Extraction → entities.json

Read clinical notes and extract all medical entities. Write `entities.json` as an array of objects.

### Entity Types

| Type | Description |
|------|-------------|
| `condition` | Diagnoses, diseases, symptoms |
| `medication` | Drug names with dose/route/frequency |
| `lab_result` | Lab test with numeric value and unit |
| `vital_sign` | Vital measurements (BP, HR, RR, SpO2, Temp) |
| `procedure` | Medical actions or tests |

### Output Format

Base entity:
```json
{"text": "type 2 diabetes mellitus", "type": "condition", "negated": false}
```

Medication entity (add name, dose as number, unit, route, frequency):
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

Lab result entity (add name, value as number, unit):
```json
{"text": "Creatinine 1.3 mg/dL", "type": "lab_result", "negated": false, "name": "Creatinine", "value": 1.3, "unit": "mg/dL"}
```

### Negation Detection

These prefixes negate the entity that follows within the same clause (period/semicolon ends scope):
- `denies`, `denied`, `no`, `not`, `without`
- `no evidence of`, `no history of`, `no prior history of`
- `negative for`, `ruled out`, `absent`

Examples:
- "denies nausea" → nausea: `negated: true`
- "denies any nausea or vomiting" → nausea AND vomiting: `negated: true`
- "No prior history of coronary artery disease" → CAD: `negated: true`
- "No evidence of heart failure" → heart failure: `negated: true`
- "Patient has hypertension" → hypertension: `negated: false`

IMPORTANT: `negated` must be boolean `true` or `false`, not a string. `dose` and `value` must be numbers, not strings.

### Complete entities.json Example

```json
[
  {"text": "type 2 diabetes mellitus", "type": "condition", "negated": false},
  {"text": "hypertension", "type": "condition", "negated": false},
  {"text": "chest pain", "type": "condition", "negated": false},
  {"text": "nausea", "type": "condition", "negated": true},
  {"text": "vomiting", "type": "condition", "negated": true},
  {"text": "coronary artery disease", "type": "condition", "negated": true},
  {"text": "heart failure", "type": "condition", "negated": true},
  {"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"},
  {"text": "Troponin I", "type": "lab_result", "negated": false, "name": "Troponin I", "value": 0.04, "unit": "ng/mL"},
  {"text": "Creatinine", "type": "lab_result", "negated": false, "name": "Creatinine", "value": 1.3, "unit": "mg/dL"},
  {"text": "BP 158/92 mmHg", "type": "vital_sign", "negated": false}
]
```

## Task 2: Medication Reconciliation → reconciliation.json

Compare admission and discharge medication lists. Write `reconciliation.json` directly.

### Output Structure

```json
{
  "admission_meds": [
    {"name": "Metformin", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}
  ],
  "discharge_meds": [
    {"name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"},
    {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}
  ],
  "changes": {
    "continued": [
      {"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "increased": [
      {"name": "Metformin", "dose": 500, "unit": "mg", "from_dose": 500, "to_dose": 1000}
    ],
    "discontinued": [
      {"name": "Omeprazole", "dose": 20, "unit": "mg"}
    ],
    "new_meds": [
      {"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"}
    ],
    "switched": [
      {"from": {"name": "Simvastatin", "dose": 20}, "to": {"name": "Atorvastatin", "dose": 40}, "drug_class": "statins"}
    ]
  }
}
```

### Change Categories

- **continued**: same drug name, same dose on both lists
- **increased**: same drug name, higher dose at discharge
- **decreased**: same drug name, lower dose at discharge
- **discontinued**: on admission only
- **new_meds**: on discharge only
- **switched**: different drug but same class (e.g., Simvastatin→Atorvastatin are both statins)

### Drug Class Groups (for switch detection)

- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole
- Sulfonylureas: glipizide, glyburide

CRITICAL: Each change entry must have a top-level `name` field (except `switched` which uses `from`/`to` objects). The `dose` field must be a number. Write the JSON file directly using write_file — do NOT create Python or other scripts.
