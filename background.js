// This script handles the quick-save shortcut and now respects all user settings.

// Function to play a sound using Web Audio API in content script
function playSound(tabId, type) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (soundType) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (soundType === "success") {
        // Success sound: two quick beeps (higher pitch)
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);

        // Second beep
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = 1000;
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.1);
        }, 100);
      } else {
        // Error sound: lower pitch, longer
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    },
    args: [type]
  }).catch(() => {
    // Silently fail if we can't play sound on this tab
    console.log('Could not play sound on this tab');
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Validate message origin - only accept messages from our own extension
  if (!sender.id || sender.id !== chrome.runtime.id) {
    console.warn("Rejected message from unauthorized sender:", sender);
    return false;
  }

  if (request.action === "quick-save") {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const activeTab = tabs[0];
        const url = activeTab.url;
        const title = activeTab.title;

        // Get all necessary data and settings from storage
        chrome.storage.local.get(
          [
            "osint-case-data",
            "activeCaseId",
            "autoCaptureSetting",
            "notificationSetting",
            "audioFeedbackSetting",
          ],
          (result) => {
            const caseData = result["osint-case-data"] || {
              cases: [],
              defaultCaseId: null,
            };
            const autoCapture = result.autoCaptureSetting;
            const showNotification = result.notificationSetting; // This will be true by default
            const audioFeedback = result.audioFeedbackSetting !== false; // Default to true

            // Determine which case to save to
            let targetCase = caseData.cases.find(
              (c) => c.id === result.activeCaseId,
            );
            if (!targetCase) {
              targetCase = caseData.cases.find(
                (c) => c.id === caseData.defaultCaseId,
              );
            }

            if (!targetCase) {
              // No case to save to, notify user if notifications are on
              // Show error badge
              chrome.action.setBadgeText({ text: "!" });
              chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
              setTimeout(() => {
                chrome.action.setBadgeText({ text: "" });
              }, 3000);

              // Play error sound if enabled
              if (audioFeedback) {
                playSound(activeTab.id, "error");
              }

              if (showNotification) {
                chrome.notifications.create({
                  type: "basic",
                  iconUrl: "icons/icon48.png",
                  title: "⚠️ CaseBandit",
                  message:
                    "❌ No case selected. Please open the extension to select a case.",
                  priority: 2
                });
              }
              return;
            }

            // This function handles saving the URL and showing the final notification
            const saveUrlAndNotify = (screenshotData) => {
              // Safely extract domain from URL
              let domain = "unknown";
              try {
                domain = new URL(url).hostname;
              } catch (e) {
                console.error("Error parsing URL in background:", e);
              }

              const newItem = {
                id: Date.now().toString(),
                url,
                title,
                notes: "",
                tags: [],
                status: "todo",
                priority: 0,
                domain: domain,
                created: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                visitCount: 1,
                screenshot: screenshotData, // Will be a data URL or null
              };

              targetCase.urls.push(newItem);

              // Save the updated data to storage
              chrome.storage.local.set({ "osint-case-data": caseData }, () => {
                // Show badge with checkmark
                chrome.action.setBadgeText({ text: "✓" });
                chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });

                // Clear badge after 2 seconds
                setTimeout(() => {
                  chrome.action.setBadgeText({ text: "" });
                }, 2000);

                // Play success sound if enabled
                if (audioFeedback) {
                  playSound(activeTab.id, "success");
                }

                // Show notification if enabled
                if (showNotification) {
                  chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icons/icon48.png",
                    title: "✅ CaseBandit",
                    message: `🔗 URL saved to "${targetCase.name}"\n\n${title}`,
                    priority: 2
                  });
                }
              });
            };

            // Check if auto-capture is enabled
            if (autoCapture && activeTab.url.startsWith("http")) {
              // If enabled, capture the screenshot first, then save
              chrome.tabs.captureVisibleTab(
                activeTab.windowId,
                { format: "png" },
                (dataUrl) => {
                  if (chrome.runtime.lastError) {
                    // If capture fails, save without the screenshot
                    console.error(
                      "Screenshot capture failed:",
                      chrome.runtime.lastError.message,
                    );
                    saveUrlAndNotify(null);
                  } else {
                    // If capture succeeds, save with the screenshot
                    saveUrlAndNotify(dataUrl);
                  }
                },
              );
            } else {
              // If auto-capture is disabled or page is invalid, save immediately without a screenshot
              saveUrlAndNotify(null);
            }
          },
        );
      }
    });
    sendResponse({ status: "received" });
  }
});
