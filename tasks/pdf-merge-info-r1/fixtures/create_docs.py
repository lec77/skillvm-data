#!/usr/bin/env python3
"""Create two small PDFs for merge+info task."""
import sys
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

width, height = letter

# Doc 1: 2 pages
c = canvas.Canvas("doc_a.pdf", pagesize=letter)
c.setFont("Helvetica-Bold", 18)
c.drawString(1*inch, height - 1.5*inch, "Document A - Research Summary")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "This is the first page of Document A.")
c.drawString(1*inch, height - 3*inch, "Author: Alice Nguyen")
c.drawString(1*inch, height - 3.5*inch, "Date: 2026-04-02")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Section 1: Findings")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "The survey collected 240 responses.")
c.drawString(1*inch, height - 3*inch, "Two effects were statistically significant.")
c.save()

# Doc 2: 3 pages
c = canvas.Canvas("doc_b.pdf", pagesize=letter)
c.setFont("Helvetica-Bold", 18)
c.drawString(1*inch, height - 1.5*inch, "Document B - Migration Plan")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Revision: 4.0")
c.drawString(1*inch, height - 3*inch, "Author: Robert Kim")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Data Cutover")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "The cutover runs in a single maintenance window.")
c.drawString(1*inch, height - 3*inch, "Two databases are copied in parallel.")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Rollback")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Rollback restores the previous snapshot within 20 minutes.")
c.save()
