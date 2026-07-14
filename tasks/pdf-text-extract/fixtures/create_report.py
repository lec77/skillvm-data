#!/usr/bin/env python3
"""Create a simple PDF report for text extraction task."""
import sys
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

c = canvas.Canvas(sys.argv[1] if len(sys.argv) > 1 else "report.pdf", pagesize=letter)
width, height = letter

# Page 1: Title and summary
c.setFont("Helvetica-Bold", 24)
c.drawString(1*inch, height - 1.5*inch, "Quarterly Sales Report")
c.setFont("Helvetica", 14)
c.drawString(1*inch, height - 2*inch, "Q4 2025 - Prepared by Finance Team")
c.setFont("Helvetica", 12)
y = height - 3*inch
lines = [
    "Executive Summary",
    "",
    "Total Revenue: $2,450,000",
    "Operating Expenses: $1,820,000",
    "Net Profit: $630,000",
    "Profit Margin: 25.7%",
    "",
    "Key Highlights:",
    "- North region grew 18% year-over-year",
    "- New product line contributed $340,000",
    "- Customer retention rate improved to 94%",
    "- Employee count increased from 145 to 168",
]
for line in lines:
    if line.startswith("Executive"):
        c.setFont("Helvetica-Bold", 14)
    else:
        c.setFont("Helvetica", 11)
    c.drawString(1*inch, y, line)
    y -= 18

# Page 2: Regional breakdown
c.showPage()
c.setFont("Helvetica-Bold", 16)
c.drawString(1*inch, height - 1.5*inch, "Regional Breakdown")
c.setFont("Helvetica", 11)
y = height - 2.5*inch
regions = [
    ("Region", "Revenue", "Growth"),
    ("North", "$820,000", "18%"),
    ("South", "$610,000", "12%"),
    ("East", "$580,000", "8%"),
    ("West", "$440,000", "15%"),
]
for region, revenue, growth in regions:
    c.drawString(1*inch, y, region)
    c.drawString(3*inch, y, revenue)
    c.drawString(5*inch, y, growth)
    y -= 20

c.save()
