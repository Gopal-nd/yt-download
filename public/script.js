const form = document.getElementById('download-form');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const url = document.getElementById('url').value;
  if (!url) return;

  progressContainer.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/download?url=${encodeURIComponent(url)}`, true);
  xhr.responseType = 'blob';

  xhr.onprogress = function(e) {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      progressBar.style.width = percentComplete + '%';
      progressText.textContent = Math.floor(percentComplete) + '%';
    }
  };

  xhr.onload = function() {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'video.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      alert('Download failed.');
    }
    progressContainer.classList.add('hidden');
  };

  xhr.onerror = function() {
    alert('An error occurred during the download.');
    progressContainer.classList.add('hidden');
  };

  xhr.send();
});
