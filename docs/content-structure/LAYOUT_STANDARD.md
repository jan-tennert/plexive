# Layout standard

Cross-format. How a post is composed on the feed card and at the top of the
detail page. This owns *composition and order of the chrome around the content*.
Its siblings: the skeletons and `SKELETON_COMMENT_STANDARD.md` own the sections
inside a post; `SVG_STANDARD.md` owns how a drawn visual looks; `IMAGE_STANDARD.md`
owns how a sourced image is licensed and shown; `STYLE_GUIDE_LONGFORM.md` owns
language. The app is dark only.

This is a frontend contract. Generators do not control layout; they fill the
fields, and the frontend composes them as described here. When a new format is
built, its card and detail page follow this document.

---

## 1. Two card layouts, chosen by the shape of the visual

The visual's shape decides the layout, not the format name.

- **Banner formats** (facts, concepts, questions, stories, academy): the
  `card_visual` is a **full-width banner across the top**, flat, about 4:1, above
  the field label. A wide drawn SVG (preferred) or a wide-croppable photo.
- **Side-cover formats** (books, people): the `card_visual` is a **hochkant cover
  beside the headline**, a book cover or a portrait. This is the current books and
  people layout and does not change.

A wide motif bands the top; a tall cover or portrait sits to the side. Nothing is
forced into the wrong frame.

---

## 2. Feed card, top to bottom (banner formats)

1. **Banner** (`card_visual`), full width, flat, with the card's top rounding.
2. **Field label**, small, in the accent color ("BIOLOGY").
3. **Headline**, full width, large serif, the key number emphasized. The star.
4. **Teasers**, exactly three.
5. **Footer**: creator (round avatar + name), reading time, difficulty (the
   three-dot scale).

The footer carries only creator, reading time, and difficulty. Per-format
metadata is deliberately not shown on the card; it varies between formats and
looks inconsistent across the feed.

Side-cover formats use the same parts, with the cover beside the headline instead
of a banner on top.

---

## 3. Detail page header, top to bottom

There is **no mini feed-card** at the top. The headline appears once. The banner
(or side cover) is what carries continuity from the card the reader tapped.

1. **App top bar**: back, the format label with its accent dot, audio. (App frame.)
2. **`card_visual`**, the same as on the card: a full-width banner for banner
   formats, a side cover for books and people, with the page's top rounding.
3. **Field label**, small, accent.
4. **Headline**, once, large serif, accent number. The first impression; it owns
   the top of the page.
5. **Meta row**: round avatar + creator name, then reading time, then difficulty.
   The creator here and on the card come from one source and always match.
6. **Quiz badge**.
7. **Sections**, in their defined order.
8. **Tags**, at the end, as small chips near the sources. Not in the header: the
   field label already orients the reader, and tags are the network and filter
   system, which belongs at the foot of the post.

---

## 4. Creator identity

The creator shown on the feed card and on the detail page resolve from the same
source and always match. Never a hardcoded fallback such as the app name.

---

## 5. Scrolling

Hide scrollbars, vertical and any horizontal, for a clean surface. A horizontal
scrollbar almost always means real overflow, usually an element wider than its
container (an over-wide banner or body SVG). Fix the overflow at its source; do
not only mask the bar.

---

## 6. Headline alignment (open taste call)

Centered reads like a title page; left-aligned matches the card more seamlessly.
Both are acceptable. Decide at the rendered look, not in the abstract. This is the
one part of the header that is taste, not rule.
