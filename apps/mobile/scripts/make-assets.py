#!/usr/bin/env python3
"""DRONCHI mobil ilovasi uchun ikonka va splash rasmlarini yaratadi.

Faqat bir marta ishlatiladi (natija assets/ papkasiga saqlanadi).
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(OUT, exist_ok=True)

NAVY_TOP = (5, 12, 26)
NAVY_BOTTOM = (10, 26, 46)
EMERALD = (52, 211, 153)
CYAN = (34, 211, 238)


def gradient_bg(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), NAVY_TOP)
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(1, size - 1)
        color = tuple(int(NAVY_TOP[i] + (NAVY_BOTTOM[i] - NAVY_TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (size, y)], fill=color)
    return img


def add_glow(img: Image.Image, center, radius: int, color, alpha: int = 110) -> None:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = center
    d.ellipse([x - radius, y - radius, x + radius, y + radius], fill=(*color, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.55))
    img.alpha_composite(layer) if img.mode == "RGBA" else img.paste(
        Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"), (0, 0)
    )


def load_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Futura.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_badge(img: Image.Image, size: int, padding_ratio: float = 0.0) -> None:
    """To'g'ridan-to'g'ri rasmga yumaloq emerald nishon + 'D' harfini chizadi."""
    draw = ImageDraw.Draw(img)
    inner = size * (1 - padding_ratio * 2)
    offset = size * padding_ratio
    radius = int(inner * 0.28)
    box = [offset, offset, offset + inner, offset + inner]

    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.rounded_rectangle(box, radius=radius, fill=(*EMERALD, 238))
    badge = badge.filter(ImageFilter.GaussianBlur(max(1, size * 0.004)))
    img.alpha_composite(badge)

    font = load_font(int(inner * 0.62))
    text = "D"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = offset + (inner - tw) / 2 - bbox[0]
    ty = offset + (inner - th) / 2 - bbox[1]
    ImageDraw.Draw(img).text((tx, ty), text, font=font, fill=(4, 18, 31, 255))


def make_icon(size: int, padding_ratio: float = 0.0) -> Image.Image:
    base = gradient_bg(size).convert("RGBA")

    # yumshoq yorug'lik dog'lari
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-size * 0.25, -size * 0.3, size * 0.7, size * 0.55], fill=(*EMERALD, 90))
    gd.ellipse([size * 0.45, size * 0.4, size * 1.3, size * 1.25], fill=(*CYAN, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.16))
    base = Image.alpha_composite(base, glow)

    draw_badge(base, size, padding_ratio)
    return base.convert("RGB")


def make_splash(width: int = 1284, height: int = 2778) -> Image.Image:
    base = Image.new("RGB", (width, height), NAVY_TOP)
    draw = ImageDraw.Draw(base)
    for y in range(height):
        t = y / max(1, height - 1)
        color = tuple(int(NAVY_TOP[i] + (NAVY_BOTTOM[i] - NAVY_TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (width, y)], fill=color)
    base = base.convert("RGBA")

    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = width / 2, height * 0.42
    r = width * 0.55
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*EMERALD, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(width * 0.18))
    base = Image.alpha_composite(base, glow)

    icon_size = 560
    badge = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
    draw_badge(badge, icon_size, 0.06)
    base.alpha_composite(badge, (int(cx - icon_size / 2), int(cy - icon_size / 2)))

    font = load_font(84)
    text = "DRONCHI"
    d2 = ImageDraw.Draw(base)
    bbox = d2.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    d2.text((cx - tw / 2 - bbox[0], cy + 300), text, font=font, fill=(234, 241, 255, 255))

    font2 = load_font(38)
    sub = "Dron ekotizimi"
    bbox2 = d2.textbbox((0, 0), sub, font=font2)
    d2.text((cx - (bbox2[2] - bbox2[0]) / 2 - bbox2[0], cy + 420), sub, font=font2, fill=(139, 154, 181, 255))

    return base.convert("RGB")


if __name__ == "__main__":
    icon = make_icon(1024)
    icon.save(os.path.join(OUT, "icon.png"))
    print("icon.png 1024x1024")

    adaptive = make_icon(1024, padding_ratio=0.18)
    adaptive.save(os.path.join(OUT, "adaptive-icon.png"))
    print("adaptive-icon.png 1024x1024")

    splash = make_splash()
    splash.save(os.path.join(OUT, "splash.png"))
    print(f"splash.png {splash.size[0]}x{splash.size[1]}")

    icon.resize((196, 196), Image.LANCZOS).save(os.path.join(OUT, "favicon.png"))
    print("favicon.png 196x196")
