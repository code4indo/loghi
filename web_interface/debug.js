document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Check if zoom buttons exist
    const zoomInButton = document.getElementById('zoom-in-button');
    const zoomOutButton = document.getElementById('zoom-out-button');
    const zoomResetButton = document.getElementById('zoom-reset-button');
    
    console.log('Zoom In button found:', !!zoomInButton);
    console.log('Zoom Out button found:', !!zoomOutButton);
    console.log('Zoom Reset button found:', !!zoomResetButton);
    
    // Check document list loading
    const documentList = document.getElementById('document-list');
    console.log('Document list element found:', !!documentList);
    
    // Check image container
    const imageContainer = document.getElementById('image-container');
    console.log('Image container found:', !!imageContainer);
    
    // Check text content area
    const textContent = document.getElementById('text-content');
    console.log('Text content area found:', !!textContent);
    
    // Add error handler to main script
    const mainScript = document.querySelector('script[src="script.js"]');
    if (mainScript) {
        console.log('Main script found');
        mainScript.onerror = function() {
            console.error('Failed to load script.js');
        };
    } else {
        console.error('Main script not found in DOM');
    }

    // Attempt to execute common functions from script.js
    try {
        console.log('Testing if main script functions are available');
        if (typeof loadDocumentList === 'function') {
            console.log('loadDocumentList function found');
        } else {
            console.log('loadDocumentList function not available');
        }
    } catch (e) {
        console.error('Error testing script functions:', e);
    }
});
