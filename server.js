const express = require('express');
const path = require('path');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Sanitize filename helper
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_').substring(0, 100);
}

// Render form
app.get('/', (req, res) => {
  res.render('index', { error: null });
});

// Handle form submit and download video
app.post('/download', async (req, res) => {
  const url = req.body.url;
  if (!url || !ytdl.validateURL(url)) {
    return res.render('index', { error: 'Please enter a valid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = sanitizeFilename(info.videoDetails.title);
    const videoPath = path.join(__dirname, `${title}_video.mp4`);
    const audioPath = path.join(__dirname, `${title}_audio.mp4`);
    const outputPath = path.join(__dirname, `${title}.mp4`);

    // Download video-only
    await new Promise((resolve, reject) => {
      const videoStream = ytdl(url, { quality: 'highestvideo' });
      videoStream.pipe(fs.createWriteStream(videoPath));
      videoStream.on('end', resolve);
      videoStream.on('error', reject);
    });

    // Download audio-only
    await new Promise((resolve, reject) => {
      const audioStream = ytdl(url, { quality: 'highestaudio' });
      audioStream.pipe(fs.createWriteStream(audioPath));
      audioStream.on('end', resolve);
      audioStream.on('error', reject);
    });

    // Merge video + audio with ffmpeg (must be installed on system)
    await new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c copy "${outputPath}"`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        // Clean up video/audio parts
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);
        resolve();
      });
    });

    // Send file for download
    res.download(outputPath, `${title}.mp4`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Delete the merged file after sending
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });
  } catch (err) {
    console.error(err);
    res.render('index', { error: 'Failed to download video. Try again!' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
