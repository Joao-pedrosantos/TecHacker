// content.js

// Local and Session Storage Data Collection
let localStorageItems = Object.entries(localStorage);
let sessionStorageItems = Object.entries(sessionStorage);

// Debug logs for storage items
console.log('Local Storage Items:', localStorageItems);
console.log('Session Storage Items:', sessionStorageItems);

browser.runtime.sendMessage({
  type: "storageData",
  localStorage: localStorageItems,
  sessionStorage: sessionStorageItems
});

// Canvas Fingerprinting Detection
(function() {
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    // Debug log for canvas method call
    console.log('Canvas toDataURL method called.');

    browser.runtime.sendMessage({ type: "canvasAccess", method: "toDataURL" });
    return originalToDataURL.apply(this, args);
  };

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function(...args) {
    // Debug log for canvas method call
    console.log('Canvas getImageData method called.');

    browser.runtime.sendMessage({ type: "canvasAccess", method: "getImageData" });
    return originalGetImageData.apply(this, args);
  };
})();

// Potential Browser Hijacking Detection
// Monitor for unauthorized redirects
window.addEventListener('beforeunload', (event) => {
  console.log('beforeunload event detected.');

  browser.runtime.sendMessage({ type: "potentialHijacking", message: "Page is attempting to redirect or unload." });
});

// Monitor for changes to window.location
let originalAssign = window.location.assign;
window.location.assign = function(url) {
  console.log(`window.location.assign called with URL: ${url}`);

  browser.runtime.sendMessage({ type: "potentialHijacking", message: `Attempting to navigate to ${url}` });
  return originalAssign.apply(this, arguments);
};
