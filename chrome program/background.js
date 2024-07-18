chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ filterText: "", isActive: false });
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });
  