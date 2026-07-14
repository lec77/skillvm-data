import json, glob

counts = {}
for path in sorted(glob.glob("text_*.txt")):
    with open(path) as f:
        for word in f.read().split():
            counts[word] = counts.get(word, 0) + 1

with open("reference_counts.json", "w") as f:
    json.dump(counts, f)
