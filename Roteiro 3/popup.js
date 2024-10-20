// popup.js

(async function() {
  let [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  let tabId = tab.id;

  console.log(`Popup opened for tab ${tabId}`);

  // Get third-party domains
  let backgroundPage = await browser.runtime.getBackgroundPage();
  let domains = backgroundPage.getThirdPartyDomains(tabId);

  console.log(`Third-party domains for tab ${tabId}:`, domains);

  // Get storage data
  let storageDataKey = `storageData_${tabId}`;
  let storageData = await browser.storage.local.get(storageDataKey);

  console.log(`Storage data for tab ${tabId}:`, storageData);

  // Get cookie data
  let cookieData = await getCookies(tab);

  console.log(`Cookie data for tab ${tabId}:`, cookieData);

  // Get canvas access data
  let canvasDataKey = `canvasAccess_${tabId}`;
  let canvasData = await browser.storage.local.get(canvasDataKey);

  console.log(`Canvas access data for tab ${tabId}:`, canvasData);

  // Get potential hijacking data
  let hijackingDataKey = `hijacking_${tabId}`;
  let hijackingData = await browser.storage.local.get(hijackingDataKey);

  console.log(`Hijacking data for tab ${tabId}:`, hijackingData);

  // Calculate privacy score
  let score = calculatePrivacyScore({
    thirdPartyDomains: domains.length,
    localStorageItems: storageData[storageDataKey]?.localStorage.length || 0,
    sessionStorageItems: storageData[storageDataKey]?.sessionStorage.length || 0,
    cookies: cookieData.total,
    canvasAccess: canvasData[canvasDataKey] ? 1 : 0,
    hijackingAttempts: hijackingData[hijackingDataKey] ? 1 : 0
  });

  console.log(`Privacy score for tab ${tabId}: ${score}/10`);

  // Display data
  document.getElementById('content').innerHTML = `
    <p><strong>Third-Party Domains:</strong> ${domains.length}</p>
    <p><strong>Cookies:</strong> ${cookieData.total} (First-Party: ${cookieData.firstParty}, Third-Party: ${cookieData.thirdParty})</p>
    <p><strong>Local Storage Items:</strong> ${storageData[storageDataKey]?.localStorage.length || 0}</p>
    <p><strong>Session Storage Items:</strong> ${storageData[storageDataKey]?.sessionStorage.length || 0}</p>
    <p><strong>Canvas Fingerprinting Attempts:</strong> ${canvasData[canvasDataKey] ? 'Yes' : 'No'}</p>
    <p><strong>Potential Hijacking Attempts:</strong> ${hijackingData[hijackingDataKey] ? 'Yes' : 'No'}</p>
    <h2>Privacy Score: ${score}/10</h2>
  `;
})();

async function getCookies(tab) {
  let url = tab.url;
  let cookies = await browser.cookies.getAll({ url });
  let firstPartyCookies = [];
  let thirdPartyCookies = [];

  let mainDomain = new URL(url).hostname;

  for (let cookie of cookies) {
    if (cookie.domain.includes(mainDomain)) {
      firstPartyCookies.push(cookie);
    } else {
      thirdPartyCookies.push(cookie);
    }
  }

  // Debug log for cookies
  console.log(`Cookies for ${url}:`, cookies);
  console.log(`First-party cookies:`, firstPartyCookies);
  console.log(`Third-party cookies:`, thirdPartyCookies);

  return {
    total: cookies.length,
    firstParty: firstPartyCookies.length,
    thirdParty: thirdPartyCookies.length
  };
}

function calculatePrivacyScore(data) {
  let score = 10;
  // Example methodology:
  if (data.thirdPartyDomains > 5) {
    score -= 2;
    console.log('Privacy score decreased by 2 due to third-party domains.');
  }
  if (data.cookies > 10) {
    score -= 1;
    console.log('Privacy score decreased by 1 due to number of cookies.');
  }
  if (data.localStorageItems > 5) {
    score -= 1;
    console.log('Privacy score decreased by 1 due to local storage items.');
  }
  if (data.canvasAccess) {
    score -= 2;
    console.log('Privacy score decreased by 2 due to canvas access.');
  }
  if (data.hijackingAttempts) {
    score -= 4;
    console.log('Privacy score decreased by 4 due to potential hijacking.');
  }
  return Math.max(score, 0);
}
