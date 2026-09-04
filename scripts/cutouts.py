"""Draw the hover lines for the interactable things in the town painting.

For each thing (the tanner's frame, the cookfire, the gate) this builds a mask
of the pixels that belong to it, then draws a gold line one painting pixel
wide around the outside of that mask and saves it as scenes/town-<name>-line.png.
The town screen lays that image over the painting and shows it on hover, so
the line follows the thing itself (see SPOTS in src/view/app.ts, which carries
each line image's box). It also saves the cutout itself under art/cutouts/
for checking the mask by eye; those are not shipped.

A thing's mask comes either from shapes traced below, or from a hand-painted
mask PNG under art/masks/ (white = the thing) when shapes cannot follow it.

The shapes are traced by hand below in the painting's own pixels (400 by
224); inside a shape, sky, grass, pale walls and (where asked) the dirt track
are keyed out by color. Re-run after any change to the painting and copy the
printed boxes into SPOTS.

    python scripts/cutouts.py
"""

import colorsys
import os

from PIL import Image, ImageDraw, ImageFilter

SCENE = 'public/scenes/town.png'
GOLD = (200, 162, 74)  # --gold in src/style.css

# Shapes: polygons and thick lines, in painting pixels. Inside a shape, sky,
# grass and pale walls are always keyed out; dirt only inside `shade_zones`,
# because hide and dirt are painted in the same colors.
THINGS = {
    'tanner': dict(
        # Hand-traced: the frame's hides, rails and posts share colors with the
        # dirt and the cottage wall behind, so no shape-and-key recipe held.
        mask_png='art/masks/town-tanner.png',
    ),
    'cookfire': dict(
        polys=[[(147, 168), (172, 168), (173, 186), (146, 186)],
               [(133, 183), (185, 183), (188, 196), (180, 203), (140, 203), (131, 196)]],
        lines=[((159, 132), (130, 199), 5), ((159, 132), (189, 199), 5), ((159, 133), (159, 170), 3)],
        clean=False,    # the tripod legs are too thin to survive the speck filter
        dirt=True,      # lit dirt keyed everywhere (the legs are darker and grayer)
        shade_zones=[(130, 166, 190, 204)],  # shadowed dirt too, around the pot and stones
    ),
    'gate': dict(
        polys=[[(150, 99), (230, 99), (230, 151), (213, 151), (213, 119), (192, 119), (192, 151), (150, 151)]],
        lines=[],
    ),
}


def is_background(r, g, b, cool=False, dirt=False, shade=False):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if s < 0.22 and v > 0.5:
        return True  # sky, clouds, pale walls
    if 0.16 < h < 0.45 and s > 0.25:
        return True  # grass and foliage
    if (dirt or shade) and 0.06 < h < 0.13 and s < 0.5 and v > 0.6:
        return True  # lit dirt
    if shade and 0.03 < h < 0.13 and 0.3 < s < 0.65 and v > 0.4:
        return True  # shadowed dirt (the pot is darker, the stones grayer, the fire redder)
    if cool and s < 0.35 and 0.45 < h < 0.95 and v > 0.3:
        return True  # shadowed cottage wall: cool and dull, where wood and hide are warm
    return False


def fill_holes(scene, out):
    """Any clear pixel not reachable from the picture's edge is inside the
    thing (a glint on the pot keyed as dirt, say): put the painting back
    there, so the hover line only runs around the outside."""
    alpha = out.split()[3].load()
    w, h = out.size
    seen = bytearray(w * h)
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x] or alpha[x, y]:
            continue
        seen[y * w + x] = 1
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    src, dst = scene.load(), out.load()
    for y in range(h):
        for x in range(w):
            if not alpha[x, y] and not seen[y * w + x]:
                r, g, b, _ = src[x, y]
                dst[x, y] = (r, g, b, 255)


def build(scene, name, polys=(), lines=(), mask_png=None, clean=True, cool=False, dirt=False, shade_zones=()):
    if mask_png is not None:
        mask = Image.open(mask_png).convert('L').point(lambda v: 255 if v > 127 else 0)
        keyed = False
    else:
        mask = Image.new('L', scene.size, 0)
        draw = ImageDraw.Draw(mask)
        for poly in polys:
            draw.polygon(poly, fill=255)
        for a, b, width in lines:
            draw.line([a, b], fill=255, width=width)
        keyed = True
    out = Image.new('RGBA', scene.size, (0, 0, 0, 0))
    src, dst, m = scene.load(), out.load(), mask.load()
    for y in range(scene.height):
        for x in range(scene.width):
            if not m[x, y]:
                continue
            r, g, b, _ = src[x, y]
            if keyed:
                shade = any(x0 <= x < x1 and y0 <= y < y1 for x0, y0, x1, y1 in shade_zones)
                if is_background(r, g, b, cool=cool, dirt=dirt, shade=shade):
                    continue
            dst[x, y] = (r, g, b, 255)
    if keyed and clean:  # drop lone specks: shrink then grow the alpha
        out.putalpha(out.split()[3].filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3)))
    fill_holes(scene, out)
    box = out.getbbox()
    os.makedirs('art/cutouts', exist_ok=True)
    out.crop(box).save(f'art/cutouts/town-{name}.png')

    # The line: every clear pixel touching the thing (8 neighbors), in gold.
    alpha = out.split()[3]
    ring = alpha.filter(ImageFilter.MaxFilter(3)).point(lambda v: 255 if v else 0)
    rp, ap = ring.load(), alpha.load()
    for y in range(scene.height):
        for x in range(scene.width):
            if ap[x, y]:
                rp[x, y] = 0
    line = Image.new('RGBA', scene.size, (*GOLD, 0))
    line.putalpha(ring)
    lbox = (box[0] - 1, box[1] - 1, box[2] + 1, box[3] + 1)
    line.crop(lbox).save(f'public/scenes/town-{name}-line.png')
    print(f"  {{ id: '{name}', box: [{lbox[0]}, {lbox[1]}, {lbox[2] - lbox[0]}, {lbox[3] - lbox[1]}] }},")


if __name__ == '__main__':
    scene = Image.open(SCENE).convert('RGBA')
    for name, spec in THINGS.items():
        build(scene, name, **spec)
