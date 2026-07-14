#!/usr/bin/env python3
"""Static hot-path probe. Usage: probe_perf.py <service_dir> <out.json>

Estimates a hot-path signature from loop/call nesting depth. Unlike the
complexity meter it weights *nested* loops (a proxy for algorithmic cost) and
emits a signature hash rather than an average — a distinct computation.
"""
import sys
import os
import ast
import json
import hashlib

ROUNDS = 13_000_000


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def loop_depth(node, depth=0):
    best = depth
    for child in ast.iter_child_nodes(node):
        d = depth + 1 if isinstance(child, (ast.For, ast.While)) else depth
        best = max(best, loop_depth(child, d))
    return best


def main() -> None:
    service_dir, out_path = sys.argv[1], sys.argv[2]
    corpus = []
    max_depth = 0
    hot_functions = []
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
                    d = loop_depth(node)
                    if d >= 2:
                        hot_functions.append(node.name)
                    max_depth = max(max_depth, d)
    result = {
        "max_loop_depth": max_depth,
        "hot_functions": sorted(hot_functions),
        "hotpath_signature": chained_digest("".join(sorted(corpus)) + f"perf:{max_depth}", ROUNDS),
    }
    result["fingerprint"] = result["hotpath_signature"]
    with open(out_path, "w") as fh:
        json.dump(result, fh, indent=2)
    print(f"probe_perf: max_loop_depth={max_depth}, {len(hot_functions)} hot function(s)")


if __name__ == "__main__":
    main()
