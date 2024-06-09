document.addEventListener('DOMContentLoaded', () => {
  const colors = document.querySelectorAll('.highlight-color');
  let selectedColor = 'yellow';
  let selectedButton = null;

  colors.forEach(color => {
    color.addEventListener('click', () => {
      selectedColor = color.getAttribute('data-color');
      console.log('Selected color:', selectedColor);

      // Remove border from the previously selected button
      if (selectedButton) {
        selectedButton.style.border = 'none';
      }

      // Add border to the currently selected button
      color.style.border = '2px solid black';
      selectedButton = color;
    });
  });

  document.getElementById('save-note').addEventListener('click', () => {
    const noteText = document.getElementById('note-text').value;
    console.log('Note text:', noteText);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (color, note) => {
          console.log('Color:', color, 'Note:', note);
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.backgroundColor = color;
            span.className = 'highlighted-text';
            span.setAttribute('data-note', note);
            span.setAttribute('data-highlight', selection.toString());
            range.surroundContents(span);

            // Save annotation
            const annotation = {
              html: span.outerHTML,
              note: note,
              highlight: selection.toString(),
              page: window.location.href,
              timestamp: new Date().toISOString()
            };

            chrome.storage.local.get({ annotations: [] }, (data) => {
              const annotations = data.annotations;
              annotations.push(annotation);
              chrome.storage.local.set({ annotations }, () => {
                console.log('Annotation saved:', annotation);
              });
            });
          }
        },
        args: [selectedColor, noteText]
      });
    });
  });

  document.getElementById('search-annotations').addEventListener('click', () => {
    const query = document.getElementById('search-query').value.toLowerCase();
    chrome.storage.local.get({ annotations: [] }, (data) => {
      const results = data.annotations.filter(annotation => 
        annotation.note.toLowerCase().includes(query) ||
        annotation.highlight.toLowerCase().includes(query) ||
        annotation.page.toLowerCase().includes(query)
      );
      displaySearchResults(results);

      // Send query to content script to highlight search results
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightSearchResults', query });
      });
    });
  });

  const displaySearchResults = (results) => {
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    if (results.length === 0) {
      resultsDiv.innerHTML = '<p>No results found</p>';
      return;
    }
    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.innerHTML = `<p>${result.note}</p><p><a href="${result.page}" target="_blank">${result.page}</a></p>`;
      resultsDiv.appendChild(resultElement);
    });
  };

  // Export annotations
  document.getElementById('export-annotations').addEventListener('click', () => {
    chrome.storage.local.get({ annotations: [] }, (data) => {
      const annotations = data.annotations;
      const blob = new Blob([JSON.stringify(annotations, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'annotations.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
});
