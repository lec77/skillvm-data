# Hand-ported 1:1 from skill-bench src/eval/automated.ts
# evalDuplicateDetection() (referenced by tasks/file-organization/
# fileorg-dedup/task.ts). Score = fraction of known duplicate groups whose
# every filename appears in the agent's LAST assistant text (legacy
# `response.text` semantics). The ground truth matches fixtures/photos/.
KNOWN_DUPLICATES = [
    ["IMG_001.jpg", "sunset_copy.jpg"],
    ["IMG_002.jpg", "mountain_backup.jpg"],
    ["IMG_004.jpg", "family_edited.jpg", "family_copy2.jpg"],
    ["IMG_005.jpg", "cat_photo.jpg"],
]


def _last_assistant_text(transcript):
    texts = []
    for entry in transcript:
        msg = entry.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "text" and item.get("text"):
                    texts.append(item["text"])
    return texts[-1] if texts else ""


def grade(transcript, workspace_path):
    text = _last_assistant_text(transcript).lower()
    found = 0
    missing = []
    for group in KNOWN_DUPLICATES:
        if all(f.lower() in text for f in group):
            found += 1
        else:
            missing.append(" + ".join(group))
    score = found / len(KNOWN_DUPLICATES)
    return [
        {"id": "duplicate-detection", "score": score, "weight": 1.0,
         "description": "Correctly identified duplicate file groups",
         "details": None if score >= 1.0 else f"missing groups: {'; '.join(missing)}"},
    ]
