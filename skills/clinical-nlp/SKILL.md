---
name: clinical-nlp
description: Extract structured medical entities (conditions, medications, procedures, lab values) from unstructured clinical text using rule-based NLP. Use when parsing clinical notes, discharge summaries, or medical reports into structured JSON format.
---

# Clinical NLP Entity Extraction

## Overview

Clinical notes contain dense unstructured text. This skill extracts structured medical entities from that text and represents them in machine-readable JSON. Accuracy depends on correct entity classification, negation detection, and attribute parsing.

## Entity Types

| Type | Description | Example |
|------|-------------|---------|
| `condition` | Diagnoses, diseases, symptoms | "type 2 diabetes mellitus", "chest pain" |
| `medication` | Drug names with dose/route/frequency | "Metformin 500mg PO BID" |
| `lab_result` | Lab test with numeric value and unit | "Creatinine 1.3 mg/dL" |
| `vital_sign` | Vital measurements | "BP 158/92 mmHg", "HR 88 bpm" |
| `procedure` | Medical actions or tests | "serial troponins", "continuous monitoring" |

## Output Format

Each extracted entity is a JSON object:

```json
{
  "text": "type 2 diabetes mellitus",
  "type": "condition",
  "negated": false,
  "section": "HPI",
  "start_pos": 142,
  "end_pos": 166
}
```

For medications, include additional fields:
```json
{
  "text": "Metformin 1000mg PO BID",
  "type": "medication",
  "negated": false,
  "section": "MEDICATIONS",
  "name": "Metformin",
  "dose": 1000,
  "unit": "mg",
  "route": "PO",
  "frequency": "BID",
  "start_pos": 0,
  "end_pos": 22
}
```

For lab results, include additional fields:
```json
{
  "text": "Creatinine 1.3 mg/dL",
  "type": "lab_result",
  "negated": false,
  "section": "LABORATORY RESULTS",
  "name": "Creatinine",
  "value": 1.3,
  "unit": "mg/dL",
  "start_pos": 0,
  "end_pos": 20
}
```

## Negation Detection

Negation phrases negate the entity immediately following them in the same clause.

**Negation triggers:**
- `no`, `not`, `none`, `without`
- `denies`, `denied`, `denying`
- `negative for`, `neg for`
- `no evidence of`, `no history of`, `no prior history of`
- `ruled out`, `rules out`
- `absent`, `absent of`
- `free of`

**Examples:**
- "denies nausea" → nausea is negated
- "no prior history of coronary artery disease" → CAD is negated
- "No evidence of heart failure" → heart failure is negated
- "Patient has hypertension" → hypertension is NOT negated

**Scope:** Negation applies only within the same clause. A period or semicolon ends the negation scope.

## Section Awareness

Clinical notes follow a standard structure. Identify the current section by scanning for section headers (lines ending with `:` or all-caps labels).

Common sections:
- `CHIEF COMPLAINT` / `CC`
- `HISTORY OF PRESENT ILLNESS` / `HPI`
- `PAST MEDICAL HISTORY` / `PMH`
- `MEDICATIONS` / `CURRENT MEDICATIONS`
- `ALLERGIES`
- `VITAL SIGNS`
- `PHYSICAL EXAM` / `EXAMINATION`
- `LABORATORY RESULTS` / `LABS`
- `IMAGING`
- `ASSESSMENT AND PLAN` / `ASSESSMENT` / `PLAN`
- `DISCHARGE MEDICATIONS`

Each extracted entity should include the section it was found in.

## Pattern Matching Strategies

### Medication Pattern

```
drug_name + dose + unit + route + frequency
```

Route abbreviations: `PO` (oral), `IV` (intravenous), `IM` (intramuscular), `SQ`/`SC` (subcutaneous), `SL` (sublingual), `TOP` (topical), `INH` (inhaled)

Frequency abbreviations: `QD`/`daily` (once daily), `BID` (twice daily), `TID` (three times daily), `QID` (four times daily), `QHS` (at bedtime), `PRN` (as needed), `Q4H`/`Q6H`/`Q8H` (every N hours)

Python regex pattern:
```python
MED_PATTERN = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|mEq|units?|IU|mL)\s+(?:(PO|IV|IM|SQ|SC|SL|TOP|INH)\s+)?(QD|BID|TID|QID|QHS|PRN|daily|Q\d+H)'
```

### Lab Value Pattern

```
analyte_name + value + unit
```

Common units: `mg/dL`, `g/dL`, `mmol/L`, `mEq/L`, `ng/mL`, `pg/mL`, `x10^3/µL`, `x10^3/uL`, `%`, `IU/L`, `U/L`

Python regex pattern:
```python
LAB_PATTERN = r'([A-Z][a-zA-Z\s]+(?:I|II|III)?)\s*(?::|level|of)?\s*:?\s*(\d+(?:\.\d+)?)\s*(mg/dL|g/dL|mmol/L|mEq/L|ng/mL|pg/mL|x10\^3/[µu]L|%|IU/L|U/L|bpm|mmHg)'
```

### Vital Sign Pattern

Common vitals and their patterns:
- Blood pressure: `BP (\d+)/(\d+) mmHg`
- Heart rate: `HR (\d+) bpm`
- Respiratory rate: `RR (\d+)`
- Oxygen saturation: `SpO2 (\d+)%`
- Temperature: `Temp (\d+(?:\.\d+)?)°?[FC]`

### Condition Detection

Scan for known medical condition terms and ICD-10 code families:

**Common conditions to detect:**
- `type 2 diabetes mellitus` / `T2DM` / `diabetes` (E11.x)
- `hypertension` / `HTN` (I10)
- `congestive heart failure` / `CHF` / `heart failure` (I50.x)
- `COPD` / `chronic obstructive pulmonary disease` (J44.x)
- `coronary artery disease` / `CAD` (I25.x)
- `atrial fibrillation` / `AFib` (I48.x)
- `myocardial infarction` / `MI` / `heart attack` (I21.x)
- `chronic kidney disease` / `CKD` (N18.x)
- `pneumonia` (J18.x)
- `sepsis` (A41.x)
- `stroke` / `CVA` / `cerebrovascular accident` (I63.x)
- `pulmonary embolism` / `PE` (I26.x)
- `deep vein thrombosis` / `DVT` (I82.x)
- `acute kidney injury` / `AKI` (N17.x)
- Symptoms: `chest pain`, `shortness of breath`, `dyspnea`, `nausea`, `vomiting`, `fever`, `headache`, `fatigue`

## Common Drug List (Top 20 Most Prescribed)

1. Metformin — diabetes (biguanide)
2. Lisinopril — hypertension/CHF (ACE inhibitor)
3. Atorvastatin / Simvastatin / Rosuvastatin — dyslipidemia (statins)
4. Amlodipine — hypertension (calcium channel blocker)
5. Omeprazole / Pantoprazole — GERD (PPI)
6. Levothyroxine — hypothyroidism
7. Aspirin — antiplatelet / analgesic
8. Metoprolol — hypertension/CHF (beta-blocker)
9. Furosemide — edema/CHF (loop diuretic)
10. Gabapentin — neuropathic pain
11. Amlodipine — hypertension
12. Losartan / Valsartan — hypertension (ARB)
13. Albuterol — asthma/COPD (bronchodilator)
14. Glipizide / Glyburide — diabetes (sulfonylurea)
15. Sertraline / Fluoxetine — depression (SSRI)
16. Warfarin / Apixaban — anticoagulant
17. Prednisone — inflammation (corticosteroid)
18. Hydrochlorothiazide — hypertension (thiazide diuretic)
19. Amoxicillin / Azithromycin — infection (antibiotic)
20. Insulin (glargine, lispro, aspart) — diabetes

## Implementation Algorithm

```python
import re
import json

def extract_entities(note_text):
    entities = []
    current_section = "UNKNOWN"

    for line_num, line in enumerate(note_text.split('\n')):
        # 1. Detect section headers
        if is_section_header(line):
            current_section = normalize_section(line)
            continue

        # 2. Detect negation context
        negated = has_negation_prefix(line)

        # 3. Match medications
        for match in MED_PATTERN.finditer(line):
            entities.append(build_medication(match, current_section, negated))

        # 4. Match lab values
        for match in LAB_PATTERN.finditer(line):
            entities.append(build_lab(match, current_section, negated))

        # 5. Match conditions
        for condition in CONDITION_LIST:
            if condition.lower() in line.lower():
                neg = is_negated_in_context(condition, line)
                entities.append(build_condition(condition, line, current_section, neg))

    return entities

def is_negated_in_context(entity, line):
    # Find position of entity in line
    pos = line.lower().find(entity.lower())
    if pos == -1:
        return False
    # Check text before entity for negation triggers
    prefix = line[:pos].lower()
    NEGATION_TRIGGERS = [
        'no ', 'not ', 'denies ', 'denied ', 'without ',
        'no evidence of ', 'no history of ', 'no prior history of ',
        'ruled out', 'negative for ', 'absent'
    ]
    return any(prefix.rstrip().endswith(t.rstrip()) or t in prefix[-30:]
               for t in NEGATION_TRIGGERS)
```

## Medication Reconciliation

When comparing two medication lists, classify changes as:

- **continued**: same drug name, same dose on both lists
- **increased**: same drug name, higher dose at discharge
- **decreased**: same drug name, lower dose at discharge
- **discontinued**: present on admission, absent at discharge
- **new_meds**: absent on admission, present at discharge
- **switched**: different drug name but same drug class (e.g., Simvastatin → Atorvastatin, both statins)

Drug class groupings for switch detection:
- Statins: atorvastatin, simvastatin, rosuvastatin, pravastatin, lovastatin
- ACE inhibitors: lisinopril, enalapril, ramipril, captopril
- ARBs: losartan, valsartan, irbesartan, olmesartan
- Beta-blockers: metoprolol, carvedilol, atenolol, bisoprolol
- PPIs: omeprazole, pantoprazole, esomeprazole, lansoprazole
- SSRIs: sertraline, fluoxetine, escitalopram, paroxetine

## Output Validation

Before returning results, validate:
1. All required fields are present for each entity type
2. `negated` is a boolean, not a string
3. `dose`, `value` are numbers, not strings
4. Entity `type` is one of the allowed values
5. Array is not empty if the note contains medical content
