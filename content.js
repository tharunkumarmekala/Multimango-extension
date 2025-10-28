// Listen for clicks on the specific "Submit Evaluation" button
document.addEventListener('click', function(event) {
  // Find the closest button element that was clicked on or within.
  const targetButton = event.target.closest('button');
  if (targetButton && targetButton.textContent.trim() === "Submit Evaluation") {
    chrome.runtime.sendMessage({ action: "incrementTaskCount" });
  }
});