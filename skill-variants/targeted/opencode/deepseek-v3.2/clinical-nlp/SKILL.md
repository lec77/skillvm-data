---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Use when parsing clinical notes, medication lists, or medical reports.
---

# Clinical NLP Entity Extraction

Extract medical entities from clinical text and write JSON directly using the write tool. Do NOT create scripts — write JSON output files directly.

## Entity Types and Fields

**condition**: `{"text", "type": "condition", "negated": bool, "section"}`
**medication**: `{"text", "type": "medication", "negated": false, "section", "name", "dose": number, "unit", "route", "frequency"}`
**lab_result**: `{"text", "type": "lab_result", "negated": false, "section", "name", "value": number, "unit"}`
**vital_sign**: `{"text", "type": "vital_sign", "negated": false, "section", "name", "value", "unit"}`
**procedure**: `{"text", "type": "procedure", "negated": false, "section"}`

## Negation Detection

These phrases before an entity mean `"negated": true`:
- "denies", "no", "no evidence of", "no history of", "no prior history of", "ruled out", "without"

Example: "denies nausea" → nausea negated=true. "has hypertension" → negated=false.
Negation scope ends at period or semicolon.

## Section Awareness

Identify section from headers like: CHIEF COMPLAINT, HISTORY OF PRESENT ILLNESS, MEDICATIONS, VITAL SIGNS, LABORATORY RESULTS, ASSESSMENT AND PLAN. Use the header text as the section value.

## Medication Reconciliation

When comparing admission vs discharge medication lists, classify into:
- **continued**: same drug, same dose
- **increased**: same drug, higher dose at discharge
- **discontinued**: on admission only
- **new_meds**: on discharge only
- **switched**: different drug but same therapeutic class (e.g. Simvastatin→Atorvastatin are both statins)

Drug classes for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin
- ACE inhibitors: lisinopril, enalapril, ramipril
- PPIs: omeprazole, pantoprazole

Output format for reconciliation:
```json
{
  "admission_meds": [{"name", "dose": number, "unit", "route", "frequency"}],
  "discharge_meds": [{"name", "dose": number, "unit", "route", "frequency"}],
  "changes": {
    "continued": [{"name", "dose": number, ...}],
    "increased": [{"name", "admission_dose": number, "discharge_dose": number, ...}],
    "discontinued": [{"name", ...}],
    "new_meds": [{"name", ...}],
    "switched": [{"admission_med", "discharge_med", "drug_class", ...}]
  }
}
```

## Key Rules

1. Write JSON output directly with the write tool — never create Python/JS scripts
2. `dose` and `value` must be numbers, not strings
3. `negated` must be boolean true/false
4. Read input files first, then write the complete JSON output in one step
