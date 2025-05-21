const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const { exec } = require('child_process');

// Replace with your desired YouTube video URL
const videoURL = 'https://www.youtube.com/watch?v=LxvErFkBXPk';

// Function to sanitize filenames
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100);
}

// Function to download video and audio separately and merge them
async function downloadAndMerge(url) {
  try {
    const info = await ytdl.getInfo(url);
    const title = sanitizeFilename(info.videoDetails.title);
    const videoPath = path.join(__dirname, `${title}_video.mp4`);
    const audioPath = path.join(__dirname, `${title}_audio.mp4`);
    const outputPath = path.join(__dirname, `${title}.mp4`);

    // Download video-only stream
    const videoStream = ytdl(url, { quality: 'highestvideo' });
    videoStream.pipe(fs.createWriteStream(videoPath));
    await new Promise((resolve, reject) => {
      videoStream.on('end', resolve);
      videoStream.on('error', reject);
    });

    // Download audio-only stream
    const audioStream = ytdl(url, { quality: 'highestaudio' });
    audioStream.pipe(fs.createWriteStream(audioPath));
    await new Promise((resolve, reject) => {
      audioStream.on('end', resolve);
      audioStream.on('error', reject);
    });

    // Merge video and audio using FFmpeg
    const ffmpegCommand = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c copy "${outputPath}"`;
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error during merging:', error);
        return;
      }
      console.log(`✅ Merged video saved as: ${outputPath}`);

      // Optional: Delete the separate video and audio files
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
    });
  } catch (err) {
    console.error('❌ Failed to download and merge video:', err);
  }
}

// Start the download and merge process
downloadAndMerge(videoURL);
