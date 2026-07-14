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
c.drawString(1*inch, height - 1.5*inch, "Document A - Introduction")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "This is the first page of Document A.")
c.drawString(1*inch, height - 3*inch, "Author: John Smith")
c.drawString(1*inch, height - 3.5*inch, "Date: 2026-01-15")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Chapter 1: Overview")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "This chapter provides an overview of the project.")
c.drawString(1*inch, height - 3*inch, "The project has three main phases.")
c.save()

# Doc 2: 3 pages
c = canvas.Canvas("doc_b.pdf", pagesize=letter)
c.setFont("Helvetica-Bold", 18)
c.drawString(1*inch, height - 1.5*inch, "Document B - Technical Spec")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Version: 2.1")
c.drawString(1*inch, height - 3*inch, "Author: Jane Doe")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Architecture")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "The system uses a microservices architecture.")
c.drawString(1*inch, height - 3*inch, "There are 5 core services.")
c.showPage()
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, height - 1.5*inch, "Deployment")
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 2.5*inch, "Deployment uses Kubernetes with 3 replicas per service.")
c.save()
