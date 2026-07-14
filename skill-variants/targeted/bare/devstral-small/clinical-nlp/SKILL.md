---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Handles entity extraction, negation detection, and medication reconciliation.
---

# Clinical NLP Entity Extraction

## CRITICAL: Writing JSON Files

When using write_file, the `content` parameter MUST be a JSON **string**, not an object. Always serialize your JSON to a string first.

CORRECT: `{"path": "output.json", "content": "[\n  {\"text\": \"diabetes\", \"type\": \"condition\"}\n]"}`
WRONG: `{"path": "output.json", "content": [{"text": "diabetes", "type": "condition"}]}`

## Entity Types

- `condition` — diagnoses, diseases, symptoms (e.g., "type 2 diabetes mellitus", "chest pain", "hypertension")
- `medication` — drugs with dose/route/frequency (e.g., "Metformin 1000mg PO BID")
- `lab_result` — lab tests with numeric values (e.g., "Troponin I: 0.04 ng/mL")
- `vital_sign` — vital measurements (e.g., "BP 158/92 mmHg", "HR 88 bpm")
- `procedure` — medical actions (e.g., "serial troponins", "continuous monitoring")

## Entity Extraction Output

Write `entities.json` as an array. Each entity object:

```json
{"text": "type 2 diabetes mellitus", "type": "condition", "negated": false}
```

For medications, add: `name`, `dose` (number), `unit`, `route`, `frequency`:
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

For lab results, add: `name`, `value` (number), `unit`:
```json
{"text": "Troponin I: 0.04 ng/mL", "type": "lab_result", "negated": false, "name": "Troponin I", "value": 0.04, "unit": "ng/mL"}
```

## Negation Detection

Set `negated: true` when entity follows these triggers: "no", "not", "denies", "denied", "without", "no evidence of", "no history of", "no prior history of", "ruled out", "negative for", "absent".

Examples:
- "denies nausea" → nausea: negated=true
- "denies any nausea or vomiting" → nausea: negated=true, vomiting: negated=true
- "No evidence of heart failure" → heart failure: negated=true
- "no prior history of coronary artery disease" → coronary artery disease: negated=true
- "Patient has hypertension" → hypertension: negated=false

Negation scope ends at period or semicolon.

## Medication Reconciliation

Compare admission vs discharge medication lists. Write `reconciliation.json` with this exact structure:

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

Change categories:
- **continued**: same drug, same dose in both lists
- **increased**: same drug, higher dose at discharge
- **discontinued**: in admission only, not in discharge
- **new_meds**: in discharge only, not in admission
- **switched**: different drug but same therapeutic class replaced it

Drug class groupings for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- ARBs: losartan, valsartan
- Beta-blockers: metoprolol, carvedilol, atenolol
- PPIs: omeprazole, pantoprazole, esomeprazole

When a drug is switched, put it in the `switched` array (not in discontinued+new_meds). Include both the original and new drug info.

## Common Abbreviations

Routes: PO=oral, IV=intravenous, IM=intramuscular, SQ/SC=subcutaneous
Frequencies: QD/daily=once daily, BID=twice daily, TID=three times daily, QID=four times daily, QHS=at bedtime, PRN=as needed

## Important Reminders

1. Parse ALL medications from the input — count must match exactly
2. `dose` and `value` fields must be numbers, not strings
3. `negated` must be boolean true/false
4. Remember: write_file content must be a STRING, not an object
