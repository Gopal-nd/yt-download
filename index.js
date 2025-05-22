const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const app = express();

// Serve static files (Tailwind CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Home route
app.get('/', (req, res) => {
  res.render('index', { error: null });
});

// Download route
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.render('index', { error: 'Please provide a YouTube video URL.' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    ytdl(videoUrl, { format: format }).pipe(res);
  } catch (err) {
    console.error(err);
    res.render('index', { error: 'Failed to download video. Please check the URL and try again.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
