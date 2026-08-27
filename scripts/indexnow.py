#!/usr/bin/env python3
"""Map deployed repository changes to canonical URLs and notify IndexNow."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOST = "www.mondstudio.co"
ORIGIN = f"https://{HOST}"
ENDPOINT = "https://api.indexnow.org/indexnow"
KEY_FILE = ROOT / "123ebf8fb85a4a0e8b1548473569d5fe.txt"
SHARED_FILES = {
    "project-page.css",
    "project-page.js",
    "robots.txt",
    "site-common.js",
    "smooth-scroll.js",
}


class RobotsMetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.noindex = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "meta":
            return
        values = {name.lower(): (value or "") for name, value in attrs}
        if values.get("name", "").lower() == "robots" and "noindex" in values.get("content", "").lower():
            self.noindex = True


def normalized_files(values: list[str]) -> list[str]:
    return sorted({value.strip().lstrip("./") for value in values if value.strip()})


def sitemap_routes() -> list[str]:
    root = ET.parse(ROOT / "sitemap.xml").getroot()
    routes: list[str] = []
    for location in root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
        url = (location.text or "").strip()
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme != "https" or parsed.netloc != HOST:
            print(f"Excluded sitemap URL outside canonical host: {url}")
            continue
        if parsed.query or parsed.fragment or not parsed.path.endswith("/"):
            print(f"Excluded non-canonical sitemap URL: {url}")
            continue
        routes.append(parsed.path)
    return list(dict.fromkeys(routes))


def route_file(route: str) -> Path:
    return ROOT / ("index.html" if route == "/" else route.lstrip("/") + "index.html")


def route_is_indexable(route: str, sitemap: set[str]) -> tuple[bool, str]:
    if route not in sitemap:
        return False, "not present in sitemap.xml"
    page = route_file(route)
    if not page.is_file():
        return False, f"canonical page is missing ({page.relative_to(ROOT)})"
    markup = page.read_text(encoding="utf-8", errors="replace")
    robots = RobotsMetaParser()
    robots.feed(markup)
    if robots.noindex:
        return False, "page contains a noindex robots directive"
    return True, ""


def html_route(path: str) -> str | None:
    if path == "index.html":
        return "/"
    if path.endswith("/index.html"):
        return "/" + path[: -len("index.html")]
    return None


def select_urls(changed_files: list[str], submit_all: bool) -> list[str]:
    routes = sitemap_routes()
    sitemap = set(routes)
    print("Changed files:")
    if changed_files:
        for path in changed_files:
            print(f"  - {path}")
    else:
        print("  (manual all-URL submission)")

    all_routes = submit_all or "sitemap.xml" in changed_files or any(
        path in SHARED_FILES for path in changed_files
    )
    if all_routes:
        reason = "manual dispatch" if submit_all else "sitemap/shared discovery change"
        print(f"Candidate strategy: all sitemap routes ({reason})")
        candidates = routes
    else:
        candidates = []
        for path in changed_files:
            route = html_route(path)
            if route is None:
                print(f"Excluded changed file (no canonical HTML mapping): {path}")
                continue
            candidates.append(route)

    print("Candidate URLs:")
    if not candidates:
        print("  (none)")
    final: list[str] = []
    for route in dict.fromkeys(candidates):
        url = ORIGIN + route
        print(f"  - {url}")
        eligible, reason = route_is_indexable(route, sitemap)
        if not eligible:
            print(f"Excluded URL: {url} — {reason}")
            continue
        parsed = urllib.parse.urlparse(url)
        if (
            parsed.scheme != "https"
            or parsed.netloc != HOST
            or not parsed.path.endswith("/")
            or parsed.query
            or parsed.fragment
            or parsed.path.endswith(".html/")
        ):
            print(f"Excluded URL: {url} — failed canonical URL validation")
            continue
        final.append(url)

    print("Final URL list:")
    if final:
        for url in final:
            print(f"  - {url}")
    else:
        print("  (none)")
    return final


def read_key() -> tuple[str, str]:
    if not KEY_FILE.is_file():
        raise ValueError(f"IndexNow key file is missing: {KEY_FILE.name}")
    key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not re.fullmatch(r"[A-Za-z0-9-]{8,128}", key):
        raise ValueError("IndexNow key file content has an invalid format")
    if KEY_FILE.stem != key:
        raise ValueError("IndexNow key filename does not match its content")
    return key, f"{ORIGIN}/{KEY_FILE.name}"


def submit(urls: list[str], dry_run: bool) -> int:
    if not urls:
        print("No eligible canonical URLs changed — IndexNow submission skipped.")
        return 0
    try:
        key, key_location = read_key()
    except ValueError as error:
        print(f"IndexNow submission skipped: {error}", file=sys.stderr)
        return 1

    payload = {
        "host": HOST,
        "key": key,
        "keyLocation": key_location,
        "urlList": urls,
    }
    if dry_run:
        print("Dry run — IndexNow would receive:")
        print(json.dumps(payload, indent=2))
        return 0

    body = json.dumps(payload).encode("utf-8")
    delays = (0, 2, 5)
    for attempt, delay in enumerate(delays, start=1):
        if delay:
            print(f"Retrying transient IndexNow failure in {delay} seconds...")
            time.sleep(delay)
        request = urllib.request.Request(
            ENDPOINT,
            data=body,
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "MOND-STUDIO-IndexNow/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                status = response.status
                response_body = response.read().decode("utf-8", errors="replace").strip()
        except urllib.error.HTTPError as error:
            status = error.code
            response_body = error.read().decode("utf-8", errors="replace").strip()
        except (urllib.error.URLError, TimeoutError) as error:
            print(f"IndexNow network failure on attempt {attempt}: {error}")
            if attempt < len(delays):
                continue
            print("IndexNow submission failed after limited retries.", file=sys.stderr)
            return 1

        print(f"IndexNow HTTP status: {status}")
        if response_body:
            print(f"IndexNow response: {response_body}")
        if status in (200, 202):
            print("IndexNow submission succeeded.")
            return 0
        if status == 429 or 500 <= status <= 599:
            if attempt < len(delays):
                continue
            print("IndexNow submission failed after limited retries.", file=sys.stderr)
            return 1
        print("IndexNow rejected the request; this status will not be retried.", file=sys.stderr)
        return 1
    return 1


def github_api(url: str, token: str) -> object:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "MOND-STUDIO-IndexNow/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def wait_for_pages(sha: str, timeout: int, interval: int) -> int:
    token = os.environ.get("GITHUB_TOKEN", "")
    repository = os.environ.get("GITHUB_REPOSITORY", "")
    if not token or not repository:
        print("GITHUB_TOKEN and GITHUB_REPOSITORY are required to wait for Pages.", file=sys.stderr)
        return 1
    deadline = time.monotonic() + timeout
    encoded_sha = urllib.parse.quote(sha, safe="")
    deployments_url = (
        f"https://api.github.com/repos/{repository}/deployments"
        f"?sha={encoded_sha}&environment=github-pages&per_page=10"
    )
    print(f"Waiting for successful GitHub Pages deployment of {sha}...")
    while time.monotonic() < deadline:
        try:
            deployments = github_api(deployments_url, token)
            if isinstance(deployments, list):
                for deployment in deployments:
                    statuses = github_api(deployment["statuses_url"], token)
                    if not isinstance(statuses, list) or not statuses:
                        continue
                    state = statuses[0].get("state", "unknown")
                    print(f"Pages deployment {deployment['id']} status: {state}")
                    if state == "success":
                        print("Matching GitHub Pages deployment completed successfully.")
                        return 0
                    if state in {"error", "failure", "inactive"}:
                        print("Matching GitHub Pages deployment did not succeed; IndexNow will be skipped.")
                        return 1
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, KeyError) as error:
            print(f"Pages deployment status check was temporarily unavailable: {error}")
        time.sleep(interval)
    print("Timed out waiting for the matching GitHub Pages deployment; IndexNow will be skipped.")
    return 1


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--changed-file", action="append", default=[])
    parser.add_argument("--changed-files-file", type=Path)
    parser.add_argument("--all", action="store_true", dest="submit_all")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--wait-for-pages", metavar="SHA")
    parser.add_argument("--wait-timeout", type=int, default=720)
    parser.add_argument("--wait-interval", type=int, default=15)
    return parser.parse_args()


def main() -> int:
    args = arguments()
    if args.wait_for_pages:
        return wait_for_pages(args.wait_for_pages, args.wait_timeout, args.wait_interval)
    changed = list(args.changed_file)
    if args.changed_files_file:
        changed.extend(args.changed_files_file.read_text(encoding="utf-8").splitlines())
    return submit(select_urls(normalized_files(changed), args.submit_all), args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
