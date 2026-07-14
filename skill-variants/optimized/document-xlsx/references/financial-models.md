# Financial Model Conventions

Read this reference when building financial models, DCF analyses, or investment banking-style spreadsheets.

## Color Coding

- **Blue text** (0,0,255): Hardcoded inputs and scenario-adjustable numbers
- **Black text** (0,0,0): All formulas and calculations
- **Green text** (0,128,0): Links from other worksheets in the same workbook
- **Red text** (255,0,0): External links to other files
- **Yellow background** (255,255,0): Key assumptions needing attention

## Number Formatting

- Years: text strings ("2024" not "2,024")
- Currency: `$#,##0;($#,##0);"-"` with units in headers ("Revenue ($mm)")
- Zeros display as "-"
- Percentages: `0.0%`
- Multiples: `0.0x` (EV/EBITDA, P/E)
- Negatives: parentheses `(123)` not minus `-123`

## Formula Construction

- Place ALL assumptions (growth rates, margins, multiples) in separate cells
- Reference assumption cells instead of hardcoding: `=B5*(1+$B$20)` not `=B5*1.05`
- Ensure consistent formulas across projection periods
- Document hardcoded sources: "Source: Company 10-K, FY2024, Page 45"
