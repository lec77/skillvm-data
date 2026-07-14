#!/usr/bin/env python3
"""Create two small PDFs for merge+info task."""
import sys
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

width, height = letter

# Doc 1: 3 pages
c = canvas.Canvas("doc_a.pdf", pagesize=letter)
c.setFont("Helvetica-Bold", 18)
c.drawString(1*inch, height - 1.5*inch, "Document A - Product Roadmap")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "This is the first page of Document A.")
c.drawString(1*inch, height - 3*inch, "Author: Carlos Mendes")
c.drawString(1*inch, height - 3.5*inch, "Date: 2026-02-09")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Quarter 1: Foundations")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "The billing rewrite lands first.")
c.drawString(1*inch, height - 3*inch, "Four teams contribute to the migration.")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Quarter 2: Expansion")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Self-serve onboarding opens to all regions.")
c.save()

# Doc 2: 2 pages
c = canvas.Canvas("doc_b.pdf", pagesize=letter)
c.setFont("Helvetica-Bold", 18)
c.drawString(1*inch, height - 1.5*inch, "Document B - Security Audit")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Revision: 1.3")
c.drawString(1*inch, height - 3*inch, "Author: Priya Raman")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Findings")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Three medium-severity issues were identified.")
c.drawString(1*inch, height - 3*inch, "No critical vulnerabilities remain open.")
c.save()
