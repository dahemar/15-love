from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, default=Path("material/15love_web_presentation_2402.pdf"))
    parser.add_argument("--page", type=int, required=True, help="1-based page number")
    args = parser.parse_args()

    data = json.loads(Path(".tmp/pdf/pages.json").read_text(encoding="utf-8"))
    p = next((x for x in data["pages"] if x["page"] == args.page), None)
    if not p:
        raise SystemExit(f"Page {args.page} not found")

    spans = sorted(p["spans"], key=lambda s: (s["bbox"][1], s["bbox"][0]))
    print(f"page={p['page']} size={p['size']} spans={len(spans)}")
    for s in spans:
        print(f"{s['bbox']} {s['font']} {s['size']} {s['color']} :: {s['text']}")


if __name__ == "__main__":
    main()
