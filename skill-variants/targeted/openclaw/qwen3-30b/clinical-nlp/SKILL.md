---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Use for parsing clinical notes, discharge summaries, or reconciling medication lists.
---

# Clinical NLP Entity Extraction

Extract structured entities from clinical notes into JSON.

## Entity Types

Use exactly these type values: `condition`, `medication`, `lab_result`, `vital_sign`, `procedure`

## Output Format — entities.json

Write a JSON **array** of entity objects. Every entity has these fields:

```json
{"text": "...", "type": "condition|medication|lab_result|vital_sign|procedure", "negated": false}
```

**Medications** — add these fields:
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

**Lab results** — add these fields:
```json
{"text": "Creatinine 1.3 mg/dL", "type": "lab_result", "negated": false, "name": "Creatinine", "value": 1.3, "unit": "mg/dL"}
```

IMPORTANT: `dose` and `value` must be **numbers** (not strings). `negated` must be **boolean** (not string).

## Negation Detection

If the text before an entity contains any of these triggers, set `negated: true`:
- `denies`, `denied`, `denying`
- `no `, `not `, `none`, `without`
- `no evidence of`, `no history of`, `no prior history of`
- `negative for`, `ruled out`, `absent`

Examples:
- "denies nausea" → nausea entity with `negated: true`
- "denies any nausea or vomiting" → BOTH nausea AND vomiting are `negated: true`
- "No prior history of coronary artery disease" → CAD entity with `negated: true`
- "No evidence of heart failure" → heart failure entity with `negated: true`
- "Patient has hypertension" → hypertension entity with `negated: false`

Scope: negation applies within the same sentence/clause only.

## Medication Reconciliation — reconciliation.json

When comparing admission vs discharge medication lists, write `reconciliation.json` with this exact structure:

```json
{
  "admission_meds": [ ... medication objects ... ],
  "discharge_meds": [ ... medication objects ... ],
  "changes": {
    "continued": [],
    "increased": [],
    "discontinued": [],
    "new_meds": [],
    "switched": []
  }
}
```

Each medication object in admission_meds and discharge_meds MUST have: `name`, `dose` (number), `unit`, `route`, `frequency`.

### Classification Rules (FOLLOW EXACTLY)

**Step 1 — Detect class switches first:**
Compare every admission drug against every discharge drug. If two drugs have DIFFERENT names but belong to the SAME drug class, they are a **switch**. Mark them as matched. Do NOT put switched drugs in discontinued or new_meds.

Drug classes for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin, lovastatin
- ACE inhibitors: lisinopril, enalapril, ramipril, captopril
- ARBs: losartan, valsartan, irbesartan, olmesartan
- Beta-blockers: metoprolol, carvedilol, atenolol, bisoprolol
- PPIs: omeprazole, pantoprazole, esomeprazole, lansoprazole

**Step 2 — For each remaining (non-switched) admission drug:**
- If the SAME drug name appears on discharge with the SAME dose → `continued`
- If the SAME drug name appears on discharge with a HIGHER dose → `increased`
- If the SAME drug name appears on discharge with a LOWER dose → `decreased`
- If the drug name does NOT appear on discharge at all → `discontinued`

**Step 3 — For each remaining (non-switched) discharge drug:**
- If the drug name does NOT appear on admission at all → `new_meds`

### Change object format

Use `name` as the key for drug names in all change entries:

```json
// continued
{"name": "Aspirin", "dose": 81, "unit": "mg", "route": "PO", "frequency": "daily"}

// increased
{"name": "Metformin", "old_dose": 500, "new_dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}

// discontinued
{"name": "Omeprazole", "dose": 20, "unit": "mg", "route": "PO", "frequency": "daily"}

// new_meds
{"name": "Glipizide", "dose": 5, "unit": "mg", "route": "PO", "frequency": "daily"}

// switched
{"name": "Simvastatin", "old_drug": "Simvastatin", "new_drug": "Atorvastatin", "class": "statins"}
```
