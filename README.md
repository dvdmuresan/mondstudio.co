# MOND Studio

Static website for https://www.mondstudio.co, hosted on GitHub Pages from `main`.
There is no package installation or application build step.

## Structure

| Location | Purpose |
| --- | --- |
| `index.html` | Homepage |
| `<page>/index.html` | Public pages and project galleries |
| `<page>/*.css`, `<page>/*.js` | Resources used only by that page |
| `assets/css/` | Shared styles |
| `assets/js/` | Shared behavior, media playback, consent and analytics |
| `assets/fonts/` | Fonts actually used by the site, with their licenses |
| `assets/icons/` | Logos, favicon and footer marks |
| `assets/images/` | Team photos, studio image, video posters and placeholders |
| `media/videos/` | Local videos still used by the pages, grouped by project |
| `data/media-library.json` | Sanity image/video inventory: URLs, dimensions and checksums |
| `scripts/` | Local validation and IndexNow deployment notification |
| `.github/workflows/` | Existing post-deployment notification workflow |

Root `*.html` redirect pages are intentional: they preserve older public links.
`CNAME`, `robots.txt`, `sitemap.xml`, `BingSiteAuth.xml` and the IndexNow key file
must remain at the root for hosting and search discovery.

## Media

Project image originals and the Full HD hero are stored in Sanity project
`sij01e0v`, dataset `production`. Pages use responsive CDN variants; the uploaded
originals remain available in Sanity. The inventory's `original_source_paths`
are historical provenance, not local dependencies.

Local video files remain where the site still needs them. Shared local URLs
start with `/assets/` or `/media/` so they work on nested routes and the 404 page.
Keep source exports, screenshots, old optimization manifests and test output out
of the published folder. Do not put Sanity tokens or other credentials here.

## New project images

Place original images in `incoming/<project-slug>/` (for example,
`incoming/megamontaj/`). This local intake folder is ignored by Git and is not
published. Upload the originals to Sanity, record their URLs and checksums in
`data/media-library.json`, then connect the project page to responsive CDN URLs.
Archive the local originals outside the site after verifying the upload.

## Check and preview

```sh
python3 scripts/check-site.py
python3 -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001/. The standard preview server is suitable for page and
image checks; it does not emulate production's HTTP byte-range video delivery.
For video behavior, also check the production CDN and a physical mobile device.
The validator checks local page/asset references, image source sets, CSS URLs,
module imports and inline JSON data without making network requests.

## Publish

GitHub Pages publishes changes pushed to `main`. Run the validator and desktop /
mobile browser checks first. The existing workflow notifies IndexNow only after
the matching Pages deployment succeeds; it can be checked without submitting:

```sh
python3 scripts/indexnow.py --all --dry-run
```

## Cleanup recovery

The pre-cleanup files, including local originals and old reports, were backed up
outside the repository in `../MONDSTUDIO-ARCHIVE/cleanup-2026-11-13/`.
That folder contains a verified `site-before-cleanup.tar.gz`, the original file
inventory with checksums and the cleanup plan. Git history was not rewritten.
