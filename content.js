// Auto-applies the 2:1 fix only when the decoded frame is 16:9 but the player
// box is 2:1 — the signature of the broken rendition. Clicking the toolbar icon
// overrides the auto decision for the current video; the override is remembered.

const CLASS = 'ds-aspect-fix';
const watched = new WeakSet();

// Per-video key: the page URL (SPA navigation changes it per video).
const videoKey = () => 'override:' + location.pathname + location.search;

function looksBroken(v) {
  if (!v.videoWidth || !v.videoHeight) return false;
  if (!v.closest('.embed-responsive-2by1')) return false;
  return Math.abs(v.videoWidth / v.videoHeight - 16 / 9) < 0.02;
}

async function evaluate() {
  const v = document.querySelector('video.ds-shaka-player__video, video');
  if (!v) return setFix(false);
  const key = videoKey();
  const { [key]: override } = await chrome.storage.local.get(key);
  const on = override ?? looksBroken(v);
  setFix(on, v);
}

function setFix(on, v) {
  document.documentElement.classList.toggle(CLASS, on);
  // The player may set inline sizing; drop it so our rules take over.
  if (on && v) v.removeAttribute('style');
  if (on) console.debug('[ds-aspect-fix] applied', v?.videoWidth, v?.videoHeight);
}

function watch(v) {
  if (watched.has(v)) return;
  watched.add(v);
  // 'resize' fires when adaptive bitrate switches to a rendition with a
  // different frame size, so a good 1280x640 -> bad 1920x1080 switch is caught.
  for (const ev of ['loadedmetadata', 'resize', 'emptied']) {
    v.addEventListener(ev, evaluate);
  }
  evaluate();
}

// The site is a single-page app: videos appear/disappear without page loads.
let lastUrl = location.href;
new MutationObserver(() => {
  document.querySelectorAll('video').forEach(watch);
  if (location.href !== lastUrl) { lastUrl = location.href; evaluate(); }
}).observe(document.documentElement, { childList: true, subtree: true });
document.querySelectorAll('video').forEach(watch);

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type !== 'toggle') return;
  const key = videoKey();
  const on = !document.documentElement.classList.contains(CLASS);
  await chrome.storage.local.set({ [key]: on });
  evaluate();
});
