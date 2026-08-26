"""Build deterministic site icon variants from the approved source artwork."""

from pathlib import Path
from shutil import copyfile

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "品牌与图标素材" / "favicon-source-512.png"
BRAND_DIR = ROOT / "public" / "brand"
APP_ICON = ROOT / "src" / "app" / "icon.ico"

PNG_OUTPUTS = {
    "favicon-16.png": 16,
    "favicon-32.png": 32,
    "apple-touch-icon.png": 180,
    "icon-192.png": 192,
    "icon-512.png": 512,
}
ICO_SIZES = (16, 32, 48)


def resized(source: Image.Image, size: int) -> Image.Image:
    return source.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    APP_ICON.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(SOURCE) as opened:
        if opened.width != opened.height:
            raise ValueError(
                f"Approved icon source must be square, got {opened.width}x{opened.height}"
            )
        source = opened.convert("RGBA")

    for filename, size in PNG_OUTPUTS.items():
        output = resized(source, size)
        output.save(
            BRAND_DIR / filename,
            format="PNG",
            compress_level=9,
            optimize=False,
        )

    ico_frames = [resized(source, size) for size in reversed(ICO_SIZES)]
    favicon = BRAND_DIR / "favicon.ico"
    ico_frames[0].save(
        favicon,
        format="ICO",
        sizes=[(size, size) for size in ICO_SIZES],
        append_images=ico_frames[1:],
    )
    copyfile(favicon, APP_ICON)


if __name__ == "__main__":
    main()
