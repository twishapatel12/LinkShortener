const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');

const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost/url-shortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  full: String,
  short: String,
});

const Url = mongoose.model('Url', urlSchema);

app.post('/shorten', async (req, res) => {
  const { full } = req.body;

  if (!full) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const url = await Url.findOne({ full });

  if (url) {
    return res.json(url);
  }

  const shortUrl = shortid.generate();

  const newUrl = new Url({
    full,
    short: shortUrl,
  });

  await newUrl.save();

  res.json(newUrl);
});

app.get('/:short', async (req, res) => {
  const { short } = req.params;

  const url = await Url.findOne({ short });

  if (!url) {
    return res.status(404).json({ error: 'URL not found' });
  }

  res.redirect(url.full);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});