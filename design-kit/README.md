# Avisha design kit v1

Two small files, `avisha-kit.css` (~12 KB) and `avisha-kit.js` (~12 KB). There are no libraries, no external fonts or CDNs and no tracking. They power the Ask Avisha demo v3, and the LearnWithAvisha one-tap tiles will use them too (after 1 Dec).

```html
<link rel="stylesheet" href="avisha-kit.css">  <!-- or inline it -->
<script src="avisha-kit.js"></script>           <!-- end of <body>; exposes window.AK -->
```
Every class starts with `ak-`. The colours are CSS variables (`--ak-navy`, `--ak-teal`, `--ak-aqua`, `--ak-pink`, `--ak-card`, `--ak-ink`, `--ak-mut`, `--ak-accent`…), and `[data-theme=dark]` overrides them.

## 1. Speed-dial floating button
```html
<div class="ak-dial" data-ak-dial>
  <div class="ak-dial-scrim" aria-hidden="true"></div>
  <ul class="ak-dial-menu" id="menu" aria-label="Quick actions">
    <li><button class="ak-dial-item" type="button">Ask a question<span class="ak-ico" aria-hidden="true">💬</span></button></li>
    …4–5 items…
  </ul>
  <button class="ak-fab" type="button" aria-expanded="false" aria-controls="menu"><span class="ak-plus" aria-hidden="true">＋</span><span class="ak-fab-text">Ask Avisha</span></button>
</div>
```
It sets itself up on load. A tap opens it: the items pop upward with a staggered spring (the one nearest the button comes first) and the ＋ turns into ✕. Tapping outside, ✕, Escape or any item closes it. When it's closed, the menu is `inert`. To drive it from code: `AK.dial(el).open() / .close()`.

## 2. Bento tile grid
`<div class="ak-bento">` holds `<button class="ak-tile ak-tilt">` tiles. You give each tile its own gradient background. Sizes: `ak-w2` is 2 columns wide and `ak-h2` is 2 rows tall. The grid has 2 columns on phones and 4 from 720 px. A tile lifts on hover (translateY + shadow) and squishes when pressed. `ak-tilt` adds a gentle 3D tilt that follows the mouse (only on mouse pointers that can hover).

## 3. Bottom sheet
```html
<div class="ak-scrim" id="sheet" aria-hidden="true">
  <div class="ak-sheet" role="dialog" aria-modal="true" aria-labelledby="t" tabindex="-1">
    <div class="ak-handle" aria-hidden="true"></div>
    <div class="ak-sheet-head"><h2 id="t">Title</h2><button class="ak-x" type="button" aria-label="Close">✕</button></div>
    <div class="ak-sheet-body">…</div>
  </div>
</div>
```
To open it, use `data-ak-sheet="sheet"` on any button, or call `AK.sheet.open("sheet", openerButton)`. It slides up on a spring curve over a dimmed, blurred backdrop. It closes on ✕, a tap on the backdrop, Escape, or a drag down of more than 110 px on the handle or header. While it's open, the rest of the page is `inert`. Focus moves to ✕, then goes back to the button that opened it. The sheet fires `ak:open` / `ak:close` events.

## 4. Story cards
```html
<div class="ak-stories" id="st" role="region" aria-roledescription="story cards" aria-label="…">
  <div class="ak-bars" aria-hidden="true"></div>
  <button class="ak-pause" type="button" aria-label="Pause the cards">❚❚</button>
  <div class="ak-story">…card 1…</div> … 3–5 cards …
  <button class="ak-tap prev" type="button" aria-label="Previous card"></button><button class="ak-tap next" type="button" aria-label="Next card"></button>
  <span class="ak-sr ak-story-live" aria-live="polite"></span>
</div>
```
`var s = AK.stories("st", {ms:5000, onEnd:fn})`, then `s.start()`, `s.stop()`, `s.go(i)` or `s.next()`. The progress bars run along the top and each card advances after 5 s. Tap the right two-thirds for the next card, the left third to go back, or use the ← → keys. Holding a finger down pauses, and so does the ❚❚ button. At the end the cards get an `.ended` class. With reduced motion on, nothing advances by itself.

## 5. Micro-interactions
- **Ripple**: automatic on `.ak-tile`, `.ak-btn`, `.ak-fab`, `.ak-dial-item` and anything with `data-ak-ripple`.
- **Checkmark draw**: `<div class="ak-check"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="34"/><path d="M21 37l10 10 20-22"/></svg></div>`, then `AK.check(el)`.
- **Confetti**: `AK.confetti(hostEl, count)`. The host needs `position:relative`. The pieces clean themselves up after 1.4 s.
- **Progress ring**: `<div class="ak-ring"><svg viewBox="0 0 84 84"><circle class="ak-ring-bg" cx="42" cy="42" r="36"/><circle class="ak-ring-fg" cx="42" cy="42" r="36"/></svg><span class="ak-ring-val"></span></div>`, then `AK.ring(el, 0..1, "3/8")`. It turns green when full.
- **Count-up**: `AK.countUp(el, 12, {sign:true, decimals:1, suffix:" %", ms:900})`.
- **Shimmer skeleton**: `AK.skeleton(hostEl, 350, done, lines)`. It shows shimmer lines (with role=status) for at most 400 ms, then calls `done()`.
- **Pop-up card**: add the class `ak-pop` to any element and it springs up when inserted.
- **Scroll reveal**: put `class="ak-reveal"` on a section and it fades up when it scrolls into view.
- **Button**: `.ak-btn` is a full-width gradient button, 58 px tall.

## 6. Hero and theme
`<header class="ak-hero">` gives a slowly drifting navy/teal/pink gradient (one transformed layer, so it's cheap). `.ak-glass` makes a frosted card on top of it. A button with `class="ak-toggle" data-ak-theme-toggle` switches light/dark (it sets `html[data-theme]` and updates `meta theme-color`). The first visit follows the device setting. Nothing is stored.

## Quality rules built in
- `prefers-reduced-motion`: every animation and transition is off. There's no tilt, ripple or confetti, the checkmark shows already drawn, and the stories don't auto-advance.
- Focus rings: 4 px pink `:focus-visible` outline on every kit control.
- Dialogs use `role="dialog"` + `aria-modal`. The menu uses `aria-expanded`/`aria-controls`. Live regions announce changes, and animated numbers are `aria-hidden` (put the plain text next to them).
- Tap targets are at least 56 px. Text colours pass AA: white text only on dark gradients, and `--ak-accent` brightens in dark mode.
- Motion uses transform/opacity only (the ring uses one SVG stroke offset).
