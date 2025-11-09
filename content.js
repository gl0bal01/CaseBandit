// NOTE: Changed from chrome.storage.sync to chrome.storage.local
chrome.storage.local.get("customShortcut", (data) => {
  const shortcut = data.customShortcut || { modifier: "ctrl", key: "<" };
  document.addEventListener("keydown", (event) => {
    const modifierPressed =
      (shortcut.modifier === "ctrl" && event.ctrlKey) ||
      (shortcut.modifier === "alt" && event.altKey) ||
      (shortcut.modifier === "shift" && event.shiftKey) ||
      (shortcut.modifier === "meta" && event.metaKey);
    if (
      modifierPressed &&
      event.key.toLowerCase() === shortcut.key.toLowerCase()
    ) {
      event.preventDefault();
      chrome.runtime.sendMessage({ action: "quick-save" });
    }
  });
});
