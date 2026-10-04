# Dreaming Spanish aspect fix

Chrome extension that un-squishes Dreaming Spanish videos whose 2:1 content is
decoded as a 16:9 frame (faces look too thin).

## How it works

- **Auto-detect:** the fix is applied only when the video sits in a 2:1 player
  box (`.embed-responsive-2by1`) but the decoded frame is 16:9
  (`videoWidth / videoHeight ≈ 1.778`). Re-checked on metadata load, on
  rendition switches (`resize`), and on in-app navigation.
- **Manual override:** click the toolbar icon to toggle the fix for the current
  video. The choice is remembered per video URL in `chrome.storage.local`.
- **Fix:** `fix.css` forces the player box to 2:1 and the video to
  `object-fit: fill` (windowed and fullscreen). It is inert until `content.js`
  adds the `ds-aspect-fix` class to `<html>`.

## Install

1. Open `chrome://extensions` and enable **Developer mode**.
2. **Load unpacked** → select this folder.
3. Open an affected video; the console logs `[ds-aspect-fix] applied 1920 1080`.

After editing files, click the reload icon on the extension card and refresh the
page.

## Limitations

- The heuristic can't tell broken 2:1 content from a genuinely 16:9 video in a
  2:1 box; the latter would be stretched. Use the toolbar toggle to turn it off.
- Uses the first `<video>` on the page.
- Overrides persist until toggled again, including after the site fixes a
  video.
- Matches `*.dreaming.com` and `*.dreamingspanish.com`.

## Files

- `manifest.json` — MV3 manifest
- `content.js` — detection and toggling
- `fix.css` — the CSS fix, scoped under `html.ds-aspect-fix`
- `background.js` — forwards toolbar clicks to the page
