---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Use for parsing clinical notes, discharge summaries, or reconciling medication lists.
---

# Clinical NLP Entity Extraction

Extract structured entities from clinical notes into JSON arrays.

## Entity Types

| Type | Description |
|------|-------------|
| `condition` | Diagnoses, diseases, symptoms |
| `medication` | Drug names with dose/route/frequency |
| `lab_result` | Lab test with numeric value and unit |
| `vital_sign` | Vital measurements |
| `procedure` | Medical actions or tests |

## Output Format

Base entity fields: `text`, `type`, `negated` (boolean), `section`, `start_pos`, `end_pos`

Medications add: `name`, `dose` (number), `unit`, `route`, `frequency`

Lab results add: `name`, `value` (number), `unit`

Example medication:
```json
{"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "section": "MEDICATIONS", "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"}
```

Example lab result:
```json
{"text": "Creatinine 1.3 mg/dL", "type": "lab_result", "negated": false, "section": "LABORATORY RESULTS", "name": "Creatinine", "value": 1.3, "unit": "mg/dL"}
```

## Negation Detection

**CRITICAL:** Check text preceding each entity for negation triggers within the same clause (period/semicolon ends scope).

Triggers: `no`, `not`, `none`, `without`, `denies`, `denied`, `denying`, `negative for`, `neg for`, `no evidence of`, `no history of`, `no prior history of`, `ruled out`, `rules out`, `absent`, `free of`

Examples: "denies nausea" → negated=true; "no evidence of heart failure" → negated=true; "Patient has hypertension" → negated=false

## Section Awareness

Identify sections by headers (all-caps or lines ending with `:`). Map entities to their section: CC, HPI, PMH, MEDICATIONS, ALLERGIES, VITAL SIGNS, PHYSICAL EXAM, LABORATORY RESULTS, IMAGING, ASSESSMENT AND PLAN, DISCHARGE MEDICATIONS.

## Medication Reconciliation

When comparing admission vs discharge medication lists, classify each change:

- **continued**: same drug, same dose
- **increased**: same drug, higher dose at discharge
- **decreased**: same drug, lower dose at discharge
- **discontinued**: on admission only, NOT on discharge (exclude switched drugs)
- **new_meds**: on discharge only, NOT on admission (exclude switched drugs)
- **switched**: different drug name but same drug class (do NOT also list these in discontinued/new_meds — switched is mutually exclusive)

Drug class groupings for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin, lovastatin
- ACE inhibitors: lisinopril, enalapril, ramipril, captopril
- ARBs: losartan, valsartan, irbesartan, olmesartan
- Beta-blockers: metoprolol, carvedilol, atenolol, bisoprolol
- PPIs: omeprazole, pantoprazole, esomeprazole, lansoprazole
- SSRIs: sertraline, fluoxetine, escitalopram, paroxetine

## Output Validation

1. All required fields present per entity type
2. `negated` must be boolean, not string
3. `dose` and `value` must be numbers, not strings
4. `type` must be one of the allowed values
