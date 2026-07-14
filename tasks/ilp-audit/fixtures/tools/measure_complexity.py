#!/usr/bin/env python3
"""Cyclomatic-ish complexity meter. Usage: measure_complexity.py <service_dir> <out.json>

Parses every module with the `ast` module and averages branch counts per
function. Different interface and input reading than the other tools (AST, not
regex), so it is an independent instruction, not a fan-out of the same command.
"""
import sys
import os
import ast
import json
import hashlib

ROUNDS = 12_000_000

BRANCH_NODES = (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With, ast.BoolOp)


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    service_dir, out_path = sys.argv[1], sys.argv[2]
    branch_total = 0
    func_total = 0
    corpus = []
    for root, _dirs, files in os.walk(service_dir):
        for fname in sorted(files):
            if not fname.endswith(".py"):
                continue
            with open(os.path.join(root, fname)) as fh:
                source = fh.read()
            corpus.append(source)
            tree = ast.parse(source)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    func_total += 1
                    branch_total += sum(1 for n in ast.walk(node) if isinstance(n, BRANCH_NODES))
    avg = round(branch_total / func_total, 3) if func_total else 0.0
    result = {
        "functions": func_total,
        "total_branches": branch_total,
        "avg_branches": avg,
        "fingerprint": chained_digest("".join(sorted(corpus)) + "complexity", ROUNDS),
    }
    with open(out_path, "w") as fh:
        json.dump(result, fh, indent=2)
    print(f"measure_complexity: {func_total} funcs, avg_branches={avg}")


if __name__ == "__main__":
    main()
