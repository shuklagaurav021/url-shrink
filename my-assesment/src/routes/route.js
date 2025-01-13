const express = require("express");
const router = express.Router();
const { createShortUrl, redirectShortUrl, trackAnalytics,getUrlAnalytics } = require("../service/sortner.service");
const rateLimit = require("express-rate-limit");

// Rate limiter for short URL creation
const createShortUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per 15 minutes
  message: {
    status: 429,
    error: "Too many requests. Please try again later.",
  },
});

// POST /shorten - Create a short URL
router.post("/shorten", createShortUrlLimiter, async (req, res) => {
  const { longUrl, customAlias, topic } = req.body;

  try {
    if (!longUrl || typeof longUrl !== "string") {
      return res.status(400).json({ error: "Valid long URL is required" });
    }

    const shortUrl = await createShortUrl(longUrl, customAlias, topic);
    res.status(201).json({ message: "Short URL created successfully", shortUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/get/shorten/:alias - Redirect to the original URL
router.get("/shorten/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Request received for ID:", id);

  try {
    const urlEntry = await redirectShortUrl(id); 

    console.log("urlEntry", urlEntry)
    const { longUrl } = urlEntry;

    // Track analytics
    const analytics = {
      timestamp: new Date(),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    };
    await trackAnalytics(id, analytics);

    // Redirect to the original URL
    res.redirect(longUrl);
  } catch (error) {
    console.error("Error redirecting short URL:", error.message);
    res.status(404).json({ error: "Short URL not found." });
  }
});



// GET /api/analytics/:alias - Get analytics for a specific short URL
router.get("/api/analytics/:alias", async (req, res) => {
  const alias = req.params.alias;

  try {
    const analyticsData = await getUrlAnalytics(alias);
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(404).json({ error: "Short URL not found or no analytics available." });
  }
});


// GET /api/analytics/topic/:topic - Get analytics for all short URLs in a specific topic
router.get("/api/analytics/topic/:topic", async (req, res) => {
  const topic = req.params.topic;

  try {
    const topicAnalytics = await getTopicAnalytics(topic);
    res.status(200).json(topicAnalytics);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


// GET /api/analytics/overall - Get overall analytics for the authenticated user
router.get("/api/analytics/overall", async (req, res) => {
  const userId = req.user.id; // Assuming user authentication is handled

  try {
    const overallAnalytics = await getOverallAnalytics(userId);
    res.status(200).json(overallAnalytics);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});
module.exports = router;
