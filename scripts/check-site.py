#!/usr/bin/env python3
"""Check local website references without downloading external resources."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://www.mondstudio.co/"
ERRORS = set()
REFERENCES = set()
CSS_URL = re.compile(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)")
MODULE_URL = re.compile(r"(?:\bfrom\s*|\bimport\s*\(\s*)['\"]([^'\"]+)['\"]")


def check(source, value, base):
    value = value.strip()
    if not value or "${" in value or value.startswith(("#", "data:", "blob:", "mailto:", "tel:", "javascript:")):
        return
    url = urlsplit(urljoin(base, value))
    if url.netloc != "www.mondstudio.co":
        return
    path = ROOT / unquote(url.path).lstrip("/")
    if path.is_dir():
        path /= "index.html"
    REFERENCES.add((source, value))
    if not path.is_file():
        ERRORS.add(f"{source}: missing {value}")


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source
        self.base = urljoin(ORIGIN, source)
        self.json_parts = None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "base":
            self.base = urljoin(self.base, values.get("href", ""))
        if tag == "script" and values.get("type") in {"application/ld+json", "importmap"}:
            self.json_parts = []
        for name in ("href", "src", "poster", "data-src", "data-lightbox-src", "data-preview-image"):
            if name in values:
                check(self.source, values[name], self.base)
        for name in ("srcset", "imagesrcset"):
            for candidate in values.get(name, "").split(","):
                if candidate.strip():
                    check(self.source, candidate.strip().split()[0], self.base)
        if tag == "meta" and values.get("property") == "og:image":
            check(self.source, values.get("content", ""), self.base)
        if tag == "meta" and values.get("http-equiv", "").lower() == "refresh":
            match = re.search(r"url=(.+)$", values.get("content", ""), re.I)
            if match:
                check(self.source, match[1], self.base)

    def handle_data(self, value):
        if self.json_parts is not None:
            self.json_parts.append(value)

    def handle_endtag(self, tag):
        if tag == "script" and self.json_parts is not None:
            try:
                json.loads("".join(self.json_parts))
            except ValueError as error:
                ERRORS.add(f"{self.source}: invalid inline JSON: {error}")
            self.json_parts = None


def main():
    sources = sorted(
        path for path in ROOT.rglob("*")
        if path.suffix in {".html", ".css", ".js"}
        and not any(part.startswith(".") or part in {"node_modules", "reports"}
                    for part in path.relative_to(ROOT).parts)
    )
    for path in sources:
        source = path.relative_to(ROOT).as_posix()
        text = path.read_text()
        base = urljoin(ORIGIN, source)
        if path.suffix == ".html":
            page = Page(source)
            page.feed(text)
            base = page.base
        for value in CSS_URL.findall(text):
            check(source, value, base)
        for value in MODULE_URL.findall(text):
            if value.startswith(("/", "./", "../", "https:")):
                check(source, value, base)
    if ERRORS:
        print("\n".join(sorted(ERRORS)))
        return 1
    print(f"PASS: {len(sources)} source files, {len(REFERENCES)} local references; no missing files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
