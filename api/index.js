const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("../models/short-url");

const app = express();

mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.bm6cq.mongodb.net/?retryWrites=true&w=majority`,
  {
    // Remove depreciation warnings.
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.get("/api/urls", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.json({ shortUrls: shortUrls });
});

app.post("/api/shorturl", async (req, res) => {
  await ShortUrl.create({
    full: req.body.longUrl,
    short: crypto.randomUUID().substring(0, 6),
  });

  res.sendStatus(200);
});

app.get("/api/:shorturl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shorturl });

  if (shortUrl === null) {
    return res.sendStatus(404);
  }

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.get("/:shorturl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shorturl });

  if (shortUrl === null) {
    return res.sendStatus(404);
  }

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.delete("/api/shorturls/:shorturl", async (req, res) => {
  await ShortUrl.findOneAndDelete({
    short: req.params.shorturl,
  });

  res.sendStatus(200);
});

app.listen(process.env.PORT || 5000);
