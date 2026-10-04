// Clicking the toolbar icon flips the fix for the current video.
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'toggle' }).catch(() => {});
});
