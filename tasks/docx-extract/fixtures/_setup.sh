#!/usr/bin/env bash
set -e
python3 -m venv .venv
.venv/bin/pip install python-docx -q
.venv/bin/python create_invoice.py invoice.docx
