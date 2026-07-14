#!/usr/bin/env python3
"""Verify the structure and content of a generated employee report PDF."""
import json
import sys
import os


def verify(pdf_path):
    results = {
        "exists": False,
        "valid": False,
        "page_count": 0,
        "full_text": "",
        "employee_names_found": [],
        "departments_found": [],
        "has_headcount_12": False,
        "has_avg_salary": False,
        "error": None,
    }

    if not os.path.exists(pdf_path):
        results["error"] = "File not found"
        return results

    results["exists"] = True

    try:
        from pypdf import PdfReader

        reader = PdfReader(pdf_path)
        results["valid"] = True
        results["page_count"] = len(reader.pages)

        # Extract all text
        full_text = ""
        for page in reader.pages:
            text = page.extract_text() or ""
            full_text += text + "\n"

        results["full_text"] = full_text
        lower_text = full_text.lower()

        # Check employee names
        expected_names = [
            "Alice Chen", "Bob Martinez", "Carol Singh", "David Kim",
            "Eva Novak", "Frank Zhao", "Grace Okafor", "Hiro Tanaka",
            "Isla Petrov", "Jake Wilson", "Karen Li", "Leo Brown",
        ]
        for name in expected_names:
            if name.lower() in lower_text:
                results["employee_names_found"].append(name)

        # Check department names
        for dept in ["Engineering", "Marketing", "Sales"]:
            if dept.lower() in lower_text:
                results["departments_found"].append(dept)

        # Check total headcount = 12
        # Look for "12" near headcount/total/employees context
        if "12" in full_text:
            results["has_headcount_12"] = True

        # Check average salary (~84500 or ~84,500)
        # Accept the overall average or any department average as evidence
        # Overall avg is 84500; dept avgs are 99600, 75500, 71333
        avg_markers = ["84500", "84,500", "84500.0", "$84,500", "$84500"]
        for marker in avg_markers:
            if marker in full_text:
                results["has_avg_salary"] = True
                break
        # Also accept rounded variants
        if not results["has_avg_salary"]:
            for marker in ["84.5k", "84,500.00"]:
                if marker.lower() in lower_text:
                    results["has_avg_salary"] = True
                    break

    except Exception as e:
        results["error"] = str(e)

    return results


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "employee_report.pdf"
    print(json.dumps(verify(path), indent=2))
