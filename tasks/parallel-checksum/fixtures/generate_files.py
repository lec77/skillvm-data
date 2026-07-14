import hashlib, json

checksums = {}
for i in range(30):
    content = bytes(range(256)) * 4 + bytes([i])
    fname = f"data_{i:02d}.bin"
    with open(fname, "wb") as f:
        f.write(content)
    checksums[fname] = hashlib.sha256(content).hexdigest()

with open("reference_checksums.json", "w") as f:
    json.dump(checksums, f)
