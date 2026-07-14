---
name: clinical-nlp
description: Extract structured medical entities from clinical text into JSON. Use for parsing clinical notes, discharge summaries, or reconciling medication lists.
---

# Clinical NLP Entity Extraction

Extract structured entities from clinical notes. Write output as valid, complete JSON.

## Entity Types

| Type | Description |
|------|-------------|
| `condition` | Diagnoses, diseases, symptoms |
| `medication` | Drug names with dose/route/frequency |
| `lab_result` | Lab test with numeric value and unit |
| `vital_sign` | Vital measurements |
| `procedure` | Medical actions or tests |

## Output Format

**IMPORTANT: Always write complete, valid JSON. Verify closing braces/brackets before writing.**

Base entity fields: `text` (string), `type` (string), `negated` (boolean — true/false, NOT string), `section` (string)

Medications add: `name` (string), `dose` (number, NOT string), `unit` (string), `route` (string), `frequency` (string)

Lab results add: `name` (string), `value` (number, NOT string), `unit` (string)

Example entities.json:
```json
[
  {"text": "type 2 diabetes mellitus", "type": "condition", "negated": false, "section": "HPI"},
  {"text": "Metformin 1000mg PO BID", "type": "medication", "negated": false, "section": "MEDICATIONS", "name": "Metformin", "dose": 1000, "unit": "mg", "route": "PO", "frequency": "BID"},
  {"text": "Creatinine 1.3 mg/dL", "type": "lab_result", "negated": false, "section": "LABORATORY RESULTS", "name": "Creatinine", "value": 1.3, "unit": "mg/dL"}
]
```

## Negation Detection

**CRITICAL:** Check text before each entity for negation triggers within the same clause (period/semicolon ends scope).

Triggers: `no`, `not`, `denies`, `denied`, `without`, `no evidence of`, `no history of`, `no prior history of`, `ruled out`, `negative for`, `absent`, `free of`

- "denies nausea" → nausea: negated=true
- "denies any nausea or vomiting" → nausea: negated=true, vomiting: negated=true
- "No evidence of heart failure" → heart failure: negated=true
- "no prior history of coronary artery disease" → coronary artery disease: negated=true
- "Patient has hypertension" → hypertension: negated=false

## Section Awareness

Identify sections by headers (all-caps or lines ending with `:`). Map entities to their section: CC, HPI, PMH, MEDICATIONS, VITAL SIGNS, LABORATORY RESULTS, ASSESSMENT AND PLAN, etc.

## Medication Reconciliation

When comparing admission vs discharge medication lists, output reconciliation.json:

```json
{
  "admission_meds": [{"name": "Drug", "dose": 100, "unit": "mg", "route": "PO", "frequency": "daily"}],
  "discharge_meds": [{"name": "Drug", "dose": 200, "unit": "mg", "route": "PO", "frequency": "daily"}],
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

Classification rules:
- **continued**: same drug name AND same dose
- **increased**: same drug name, higher dose at discharge
- **decreased**: same drug name, lower dose at discharge
- **discontinued**: drug on admission list but NO matching drug on discharge (and not part of a class switch)
- **new_meds**: drug on discharge list but NO matching drug on admission (and not part of a class switch)
- **switched**: different drug name but same drug class — do NOT also list in discontinued or new_meds

**IMPORTANT:** switched is mutually exclusive with discontinued/new_meds. If Drug A (admission) is replaced by Drug B (discharge) from the same class, put in switched ONLY, not in discontinued or new_meds.

Drug class groupings for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin, lovastatin
- ACE inhibitors: lisinopril, enalapril, ramipril, captopril
- ARBs: losartan, valsartan, irbesartan, olmesartan
- Beta-blockers: metoprolol, carvedilol, atenolol, bisoprolol
- PPIs: omeprazole, pantoprazole, esomeprazole, lansoprazole
- SSRIs: sertraline, fluoxetine, escitalopram, paroxetine

### Reconciliation Algorithm

Follow these steps in order:

1. Parse each medication line into {name, dose, unit, route, frequency}
2. For each admission drug, check if the SAME drug name exists at discharge:
   - Same name + same dose → **continued**
   - Same name + higher dose → **increased**
   - Same name + lower dose → **decreased**
3. Find drugs on admission with NO same-name match at discharge. Check if a same-CLASS drug exists at discharge → **switched** (put the from/to pair here)
4. Any admission drug with NO same-name AND NO same-class match at discharge → **discontinued**
5. Any discharge drug with NO same-name AND NO same-class match from admission → **new_meds**

### Worked Example

Admission: Aspirin 81mg PO daily, Omeprazole 20mg PO daily, Simvastatin 20mg PO QHS
Discharge: Aspirin 81mg PO daily, Atorvastatin 40mg PO QHS, Furosemide 20mg PO daily

Result:
- **continued**: Aspirin (same name, same dose)
- **switched**: Simvastatin → Atorvastatin (both statins — NOT in discontinued/new_meds)
- **discontinued**: Omeprazole (no same-name or same-class match at discharge)
- **new_meds**: Furosemide (no same-name or same-class match from admission)
