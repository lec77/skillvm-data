#!/usr/bin/env python3
import sys, json

f = sys.argv[1]
with open(f) as fh:
    s = fh.read().strip()
if not s.endswith('}'):
    s += '\n}'
try:
    obj = json.loads(s)
    with open(f, 'w') as fh:
        json.dump(obj, fh, indent=2)
        fh.write('\n')
    print("OK")
except json.JSONDecodeError as e:
    print(f"ERROR: {e}")
    sys.exit(1)
