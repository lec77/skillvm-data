---
name: clinical-nlp
description: Extract structured medical entities from clinical text and perform medication reconciliation. Use when parsing clinical notes or comparing medication lists.
---

# Clinical NLP

CRITICAL RULES:
1. Always read input files first. Never guess file contents.
2. Analyze text yourself — do NOT write Python or other scripts.
3. Use compact JSON (2-space indent max) to avoid truncation.
4. Only write the output file requested by the task prompt. If asked to write reconciliation.json, do NOT also write entities.json or vice versa.

## Task A: Entity Extraction (entities.json)

When asked to extract entities from a clinical note, write an array to `entities.json`.

Each entity:
```json
{"text":"type 2 diabetes mellitus","type":"condition","negated":false}
```

Types: `condition`, `medication`, `lab_result`, `vital_sign`, `procedure`

Medication entities add: `name`, `dose` (number), `unit`, `route`, `frequency`
Lab result entities add: `name`, `value` (number), `unit`

### Negation
Set `negated: true` when preceded by: "denies", "no", "not", "without", "no evidence of", "no history of", "no prior history of", "ruled out", "negative for".
- "denies nausea" → negated=true
- "denies any nausea or vomiting" → both negated=true
- "no prior history of coronary artery disease" → negated=true
- "No evidence of heart failure" → negated=true
- "Patient has hypertension" → negated=false

### What to Extract
Conditions: diabetes, hypertension, chest pain, shortness of breath, heart failure, coronary artery disease, nausea, vomiting, ACS, etc.
Medications: all drugs with dose info (Metformin, Lisinopril, Aspirin, etc.)
Labs: Troponin, BNP, Creatinine, Glucose, HbA1c, WBC, Hemoglobin, etc.
Vitals: BP, HR, RR, SpO2, Temp
Procedures: monitoring, serial tests, etc.

Extract ALL entities — aim for 15+ from a typical note.

## Task B: Medication Reconciliation (reconciliation.json)

When asked to reconcile medication lists, write `reconciliation.json` with this structure:

```json
{
  "admission_meds": [{"name":"Metformin","dose":500,"unit":"mg","route":"PO","frequency":"BID"}],
  "discharge_meds": [{"name":"Metformin","dose":1000,"unit":"mg","route":"PO","frequency":"BID"}],
  "changes": {
    "continued": [{"name":"Aspirin","dose":81,"unit":"mg","route":"PO","frequency":"daily"}],
    "increased": [{"name":"Metformin","dose":1000,"unit":"mg","route":"PO","frequency":"BID"}],
    "discontinued": [{"name":"Omeprazole","dose":20,"unit":"mg","route":"PO","frequency":"daily"}],
    "new_meds": [{"name":"Glipizide","dose":5,"unit":"mg","route":"PO","frequency":"daily"}],
    "switched": [{"from":"Simvastatin","to":"Atorvastatin","class":"statin"}]
  }
}
```

Change categories:
- **continued**: same drug, same dose
- **increased**: same drug, higher dose at discharge
- **discontinued**: on admission only
- **new_meds**: on discharge only
- **switched**: different drug in same class

Drug classes for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin
- ACE inhibitors: lisinopril, enalapril
- Beta-blockers: metoprolol, carvedilol
- PPIs: omeprazole, pantoprazole
- SSRIs: sertraline, fluoxetine

### Validation
- `dose`/`value` must be numbers, not strings
- `negated` must be boolean true/false
- Count medications from actual file contents — match exactly
