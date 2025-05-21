// Replace with your desired YouTube video URL
const videoURL = 'https://www.youtube.com/watch?v=LxvErFkBXPk';
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const path = require('path');

// Function to sanitize filenames
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100);
}

// Function to download video with audio
async function downloadVideo(url) {
  try {
    const info = await ytdl.getInfo(url);
    const sanitizedTitle = sanitizeFilename(info.videoDetails.title);
    const output = path.join(__dirname, `${sanitizedTitle}.mp4`);
    
    // Download with both video and audio
    const videoStream = ytdl(url, { 
      quality: 'highest',  // This will get the highest quality with both audio and video
      filter: 'audioandvideo' // Explicitly request formats with both audio and video
    });
    
    videoStream.pipe(fs.createWriteStream(output));
    
    videoStream.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total * 100;
      console.log(`Downloading: ${percent.toFixed(2)}% of ${(total / 1024 / 1024).toFixed(2)} MB`);
    });
    
    videoStream.on('end', () => {
      console.log(`✅ Download complete: ${output}`);
    });
    
    videoStream.on('error', (err) => {
      console.error('❌ Error during download:', err);
    });
  } catch (err) {
    console.error('❌ Failed to download video:', err);
  }
}

// Start the download
downloadVideo(videoURL).catch(console.error);