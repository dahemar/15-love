from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import fitz  # PyMuPDF


@dataclass(frozen=True)
class ExtractOptions:
    zoom: float = 2.0
    max_pages: int | None = None


def _round4(value: float) -> float:
    return float(f"{value:.4f}")


def _color_int_to_hex(rgb_int: int) -> str:
    # PyMuPDF uses int like 0xRRGGBB
    return f"#{rgb_int:06x}"


def _iter_text_spans(text_dict: dict[str, Any]) -> Iterable[dict[str, Any]]:
    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text = (span.get("text") or "").strip()
                if not text:
                    continue
                yield span


def extract_pdf(pdf_path: Path, out_dir: Path, options: ExtractOptions) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)

    page_count = doc.page_count
    max_pages = options.max_pages if options.max_pages is not None else page_count
    max_pages = min(max_pages, page_count)

    pages: list[dict[str, Any]] = []
    for idx in range(max_pages):
        page = doc.load_page(idx)
        rect = page.rect

        # Render page image
        pix = page.get_pixmap(matrix=fitz.Matrix(options.zoom, options.zoom), alpha=False)
        img_path = out_dir / f"page-{idx + 1:02d}.png"
        pix.save(img_path)

        # Extract text with styling details
        text_dict = page.get_text("dict")
        spans: list[dict[str, Any]] = []
        for span in _iter_text_spans(text_dict):
            bbox = span.get("bbox", [0, 0, 0, 0])
            spans.append(
                {
                    "text": " ".join((span.get("text") or "").split()),
                    "bbox": [_round4(bbox[0]), _round4(bbox[1]), _round4(bbox[2]), _round4(bbox[3])],
                    "font": span.get("font"),
                    "size": _round4(float(span.get("size") or 0)),
                    "color": _color_int_to_hex(int(span.get("color") or 0)),
                    "flags": int(span.get("flags") or 0),
                }
            )

        pages.append(
            {
                "page": idx + 1,
                "size": [_round4(rect.width), _round4(rect.height)],
                "image": img_path.name,
                "spans": spans,
            }
        )

    (out_dir / "pages.json").write_text(
        json.dumps({"source": str(pdf_path), "pageCount": page_count, "pages": pages}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    # Small human-friendly summary
    summary_lines: list[str] = []
    summary_lines.append(f"PDF: {pdf_path}")
    summary_lines.append(f"Pages: {page_count} (extracted {max_pages})")
    summary_lines.append(f"Render zoom: {options.zoom}x")
    for p in pages:
        summary_lines.append("")
        summary_lines.append(f"## Page {p['page']} ({p['size'][0]}×{p['size'][1]} pts) spans={len(p['spans'])}")
        # show the first 12 spans in reading order (top->bottom, left->right)
        preview = sorted(p["spans"], key=lambda s: (s["bbox"][1], s["bbox"][0]))[:12]
        for s in preview:
            summary_lines.append(
                f"- {s['bbox']} {s['font']} {s['size']} {s['color']}: {s['text'][:140]}"
            )
    (out_dir / "summary.md").write_text("\n".join(summary_lines) + "\n", encoding="utf-8")


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    pdf_path = repo_root / "material" / "15love_web_presentation_2402.pdf"
    out_dir = repo_root / ".tmp" / "pdf"
    extract_pdf(pdf_path, out_dir, ExtractOptions(zoom=2.0))
    print(f"Wrote {out_dir / 'pages.json'} and page images to {out_dir}")


if __name__ == "__main__":
    main()
