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
c.drawString(1*inch, height - 1.5*inch, "Document A - Field Notes")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "This is the first page of Document A.")
c.drawString(1*inch, height - 3*inch, "Author: Hannah Bergstrom")
c.drawString(1*inch, height - 3.5*inch, "Date: 2026-06-21")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Site Survey")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "The northern plot was sampled twice.")
c.drawString(1*inch, height - 3*inch, "Soil moisture stayed above 30 percent.")
c.save()

# Doc 2: 4 pages
c = canvas.Canvas("doc_b.pdf", pagesize=letter)
c.setFont("Helvetica-Bold", 18)
c.drawString(1*inch, height - 1.5*inch, "Document B - Deployment Playbook")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Revision: 3.2")
c.drawString(1*inch, height - 3*inch, "Author: Marcus Webb")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Preflight Checks")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Every release runs the smoke suite first.")
c.drawString(1*inch, height - 3*inch, "There are 8 required checks.")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Rollout")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Traffic shifts in three waves of 10, 50, and 100 percent.")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Incident Response")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "The on-call engineer owns the rollback decision.")
c.save()
