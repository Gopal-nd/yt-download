const express = require('express');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100);
}

app.get('/', (req, res) => {
  res.render('index', { error: "Something went wrong!" });

});

app.post('/download', async (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).send('No URL provided.');

  try {
    const info = await ytdl.getInfo(url);
    const title = sanitizeFilename(info.videoDetails.title);

    const videoPath = path.resolve(__dirname, `${title}_video.mp4`);
    const audioPath = path.resolve(__dirname, `${title}_audio.mp4`);
    const outputPath = path.resolve(__dirname, `${title}.mp4`);

    // Download video-only stream
    const videoStream = ytdl(url, { quality: 'highestvideo' });
    const videoFile = fs.createWriteStream(videoPath);
    videoStream.pipe(videoFile);

    await new Promise((resolve, reject) => {
      videoFile.on('finish', resolve);
      videoFile.on('error', reject);
    });

    // Download audio-only stream
    const audioStream = ytdl(url, { quality: 'highestaudio' });
    const audioFile = fs.createWriteStream(audioPath);
    audioStream.pipe(audioFile);

    await new Promise((resolve, reject) => {
      audioFile.on('finish', resolve);
      audioFile.on('error', reject);
    });

    // Merge using fluent-ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions('-c copy') // copy streams without re-encoding
        .on('error', (err) => {
          console.error('Error during ffmpeg processing:', err);
          reject(err);
        })
        .on('end', () => {
          console.log('Merging finished!');
          // Clean up separate files
          fs.unlinkSync(videoPath);
          fs.unlinkSync(audioPath);
          resolve();
        })
        .save(outputPath);
    });

    // After merging, send download link or success message
    res.download(outputPath, (err) => {
      if (err) console.error('Error sending file:', err);
      // Delete merged file after sending (optional)
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to download or merge video.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
