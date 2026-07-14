---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Handles entity extraction, negation detection, and medication reconciliation.
---

# Clinical NLP

Extract medical entities from clinical text into structured JSON.

## Entity Types

- `condition`: diagnoses, symptoms (diabetes, chest pain, nausea)
- `medication`: drugs with dose/route/frequency (Metformin 500mg PO BID)
- `lab_result`: lab tests with numeric values (Creatinine 1.3 mg/dL)
- `vital_sign`: vitals (BP 158/92 mmHg, HR 88 bpm)
- `procedure`: medical actions (serial troponins, monitoring)

## Output Schemas

### Entity extraction → `entities.json`

Array of objects. Base fields for all entities:

```json
{"text": "hypertension", "type": "condition", "negated": false, "section": "HPI"}
```

Medications add: `name` (string), `dose` (number), `unit`, `route`, `frequency`
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "section": "MEDICATIONS", "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

Lab results add: `name` (string), `value` (number), `unit`
```json
{"text": "Creatinine 1.3 mg/dL", "type": "lab_result", "negated": false, "section": "LABORATORY RESULTS", "name": "Creatinine", "value": 1.3, "unit": "mg/dL"}
```

**CRITICAL**: `negated` must be boolean (not string). `dose` and `value` must be numbers (not strings).

## Negation Detection

Set `negated: true` when entity follows a negation trigger in the same clause:
- "denies nausea" → nausea negated
- "no prior history of coronary artery disease" → CAD negated
- "No evidence of heart failure" → heart failure negated
- "rule out ACS" → ACS negated

Triggers: no, not, none, without, denies, denied, negative for, no evidence of, no history of, no prior history of, ruled out, absent, free of

Scope ends at period or semicolon. "Patient has hypertension" → NOT negated.

## Section Headers

Map entities to their section: CHIEF COMPLAINT, HPI, MEDICATIONS, VITAL SIGNS, LABORATORY RESULTS, ASSESSMENT AND PLAN, DISCHARGE MEDICATIONS, etc.

## Medication Reconciliation → `reconciliation.json`

Compare admission vs discharge medication lists. Output format:

```json
{
  "admission_meds": [{"name": "Metformin", "dose": 500, "unit": "mg", "route": "PO", "frequency": "BID"}],
  "discharge_meds": [{"name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}],
  "changes": {
    "continued": [],
    "increased": [],
    "decreased": [],
    "discontinued": [],
    "new_meds": [],
    "switched": []
  }
}
```

Change categories:
- **continued**: same drug, same dose
- **increased/decreased**: same drug, different dose
- **discontinued**: in admission only
- **new_meds**: in discharge only
- **switched**: different drug, same class (e.g. Simvastatin → Atorvastatin = statin switch)

Drug classes for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- PPIs: omeprazole, pantoprazole, esomeprazole
- Beta-blockers: metoprolol, carvedilol, atenolol
- SSRIs: sertraline, fluoxetine, escitalopram
