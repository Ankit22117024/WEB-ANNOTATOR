chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightSearchResults') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightSearchResults', query: request.query });
    });
  }
});
