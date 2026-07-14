#!/usr/bin/env bash
set -e
python3 -m venv .venv
.venv/bin/pip install reportlab -q
.venv/bin/python create_report.py report.pdf
