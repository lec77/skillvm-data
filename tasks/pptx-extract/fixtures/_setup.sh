#!/usr/bin/env bash
set -e
python3 -m venv .venv
.venv/bin/pip install python-pptx -q
.venv/bin/python create_slides.py review.pptx
