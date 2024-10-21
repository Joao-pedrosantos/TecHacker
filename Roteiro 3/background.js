// background.js

let thirdPartyDomains = {};

browser.webRequest.onCompleted.addListener(
  (details) => {
    let tabId = details.tabId;
    if (tabId === -1) return; 

    let url = new URL(details.url);
    let domain = url.hostname;

    // Debug log for each request
    console.log(`Request made to: ${domain} on tab ${tabId}`);

    browser.tabs.get(tabId).then((tab) => {
      let tabUrl = new URL(tab.url);
      let mainDomain = tabUrl.hostname;

      // Debug log for main domain
      console.log(`Main domain for tab ${tabId}: ${mainDomain}`);

      if (domain !== mainDomain && !domain.endsWith(mainDomain)) {
        if (!thirdPartyDomains[tabId]) {
          thirdPartyDomains[tabId] = new Set();
        }
        thirdPartyDomains[tabId].add(domain);
        console.log(`Third-party domain detected on tab ${tabId}: ${domain}`);
      }
    }).catch((error) => {
      console.error(`Error getting tab information: ${error}`);
    });
  },// Ignore requests not associated with a tab
  { urls: ["<all_urls>"] }
);

browser.tabs.onRemoved.addListener((tabId) => {
  // Debug log for tab removal
  console.log(`Tab closed: ${tabId}. Cleaning up data.`);
  delete thirdPartyDomains[tabId];
});

function getThirdPartyDomains(tabId) {
  return thirdPartyDomains[tabId]
    ? Array.from(thirdPartyDomains[tabId])
    : [];
}

// Listener for messages from content scripts
browser.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab) return;

  let tabId = sender.tab.id;

  console.log(`Message received from tab ${tabId}:`, message);

  if (message.type === "storageData") {
    browser.browserAction.setBadgeText({ text: "!", tabId });
    browser.browserAction.setBadgeBackgroundColor({ color: "red", tabId });
    browser.storage.local.set({ [`storageData_${tabId}`]: message });

    // Debug log for storage data
    console.log(`Storage data saved for tab ${tabId}:`, message);
  } else if (message.type === "canvasAccess") {
    // Handle canvas fingerprinting detection
    browser.storage.local.set({ [`canvasAccess_${tabId}`]: message });

    // Debug log for canvas access
    console.log(`Canvas access detected on tab ${tabId}:`, message);
  } else if (message.type === "potentialHijacking") {
    // Handle potential hijacking alerts
    browser.storage.local.set({ [`hijacking_${tabId}`]: message });

    // Debug log for potential hijacking
    console.log(`Potential hijacking detected on tab ${tabId}:`, message);
  }
});
