// Helper function to apply a single annotation
const applyAnnotation = (annotation) => {
  console.log('Applying annotation:', annotation);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = annotation.html;
  const newNode = tempDiv.firstChild;

  // Attach the note element
  const noteElement = document.createElement('div');
  noteElement.className = 'sticky-note';
  noteElement.textContent = annotation.note;
  noteElement.style.position = 'absolute';
  noteElement.style.backgroundColor = '#ffeb3b';
  noteElement.style.border = '1px solid #000';
  noteElement.style.padding = '5px';
  noteElement.style.zIndex = '9999';
  noteElement.style.display = 'none';
  noteElement.style.whiteSpace = 'pre-wrap';

  newNode.addEventListener('mouseenter', () => {
    noteElement.style.display = 'block';
  });
  newNode.addEventListener('mouseleave', () => {
    noteElement.style.display = 'none';
  });

  document.body.appendChild(noteElement);

  const rect = newNode.getBoundingClientRect();
  noteElement.style.top = `${rect.top + window.scrollY}px`;
  noteElement.style.left = `${rect.right + window.scrollX}px`;

  // Append the annotated element to the body
  const nodes = document.body.querySelectorAll("*");
  nodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.innerHTML.includes(newNode.textContent)) {
      node.innerHTML = node.innerHTML.replace(newNode.textContent, newNode.outerHTML);
    }
  });
};

// Load all annotations for the current page
const loadAnnotations = () => {
  console.log('Loading annotations for page:', window.location.href);
  chrome.storage.local.get({ annotations: [] }, (data) => {
    const annotations = data.annotations.filter(ann => ann.page === window.location.href);
    console.log('Found annotations:', annotations);
    annotations.forEach(applyAnnotation);
  });
};

// Apply annotations when the page loads
window.addEventListener('load', loadAnnotations);

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightSearchResults') {
    highlightSearchResults(request.query);
  }
});

const highlightSearchResults = (query) => {
  const annotations = document.querySelectorAll('.highlighted-text');
  annotations.forEach(annotation => {
    if (annotation.getAttribute('data-note').toLowerCase().includes(query) ||
        annotation.getAttribute('data-highlight').toLowerCase().includes(query)) {
      annotation.style.border = '2px solid red';
    } else {
      annotation.style.border = 'none';
    }
  });
};
