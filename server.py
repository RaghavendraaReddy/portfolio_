from __future__ import annotations

import argparse
import mimetypes
import posixpath
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


REPO_ROOT = Path(__file__).resolve().parent


class MirrorRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/_next/image":
            self.serve_next_image(parsed.query, include_body=True)
            return

        self.path = parsed.path or "/"
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/_vercel/insights/view":
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length > 0:
                self.rfile.read(content_length)
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return

        self.send_error(HTTPStatus.NOT_IMPLEMENTED, "Unsupported method")

    def do_HEAD(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/_next/image":
            self.serve_next_image(parsed.query, include_body=False)
            return

        self.path = parsed.path or "/"
        super().do_HEAD()

    def serve_next_image(self, query: str, include_body: bool) -> None:
        params = parse_qs(query)
        raw_url = params.get("url", [None])[0]

        if not raw_url:
            self.send_error(HTTPStatus.BAD_REQUEST, "Missing image url")
            return

        decoded_path = posixpath.normpath(unquote(raw_url))
        if not decoded_path.startswith("/"):
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid image url")
            return

        asset_path = (REPO_ROOT / decoded_path.lstrip("/")).resolve()
        try:
            asset_path.relative_to(REPO_ROOT)
        except ValueError:
            self.send_error(HTTPStatus.FORBIDDEN, "Invalid image path")
            return

        if not asset_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Image not found")
            return

        mime_type, _ = mimetypes.guess_type(str(asset_path))
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime_type or "application/octet-stream")
        self.send_header("Content-Length", str(asset_path.stat().st_size))
        self.end_headers()

        if include_body:
            with asset_path.open("rb") as image_file:
                self.wfile.write(image_file.read())


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the mirrored Connor Love site locally.")
    parser.add_argument("port", nargs="?", type=int, default=5500)
    args = parser.parse_args()

    handler = partial(MirrorRequestHandler, directory=str(REPO_ROOT))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Serving mirror at http://127.0.0.1:{args.port}/")
        server.serve_forever()


if __name__ == "__main__":
    main()
