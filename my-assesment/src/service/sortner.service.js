const db = require("../models"); // Ensure the correct path to models
const { v4: uuidv4 } = require("uuid");
const baseUrl = "http://localhost:3002";

// Create a short URL
const createShortUrl = async (longUrl, customAlias, topic) => {
  const shortId = customAlias || uuidv4().slice(0, 6);
  const shortUrl = `${baseUrl}/api/shorten/${shortId}`;
console.log("shortUrl", shortUrl)
  // Save to database
  const newUrl = await db.dummyUrl.create({
    id: uuidv4(),
    longUrl,
    shortUrl,
    customAlias: customAlias || shortId,
    topic: topic || "general",
    createdAt: new Date(),
  });

  return newUrl;
};

const getUrlAnalytics = async (alias) => {
  const shortUrl = `${baseUrl}/api/shorten/${alias}`;
  const urlEntry = await db.dummyUrl.findOne({ where: { shortUrl } });

  if (!urlEntry) {
    throw new Error("Short URL not found.");
  }

  // Get total clicks
  const totalClicks = await db.analytics.count({ where: { urlId: urlEntry.id } });

  // Get unique users (based on distinct IPs)
  const uniqueUsers = await db.analytics.count({
    where: { urlId: urlEntry.id },
    distinct: true,
    col: 'ip'
  });

  // Get clicks by date (last 7 days)
  const clicksByDate = await db.analytics.findAll({
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('timestamp')), 'date'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'clickCount'],
    ],
    where: {
      urlId: urlEntry.id,
      timestamp: {
        [db.Sequelize.Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    group: ['date'],
    raw: true,
  });

  // Get OS type breakdown
  const osType = await db.analytics.findAll({
    attributes: [
      'userAgent',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'uniqueClicks'],
      [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('ip'))), 'uniqueUsers'],
    ],
    where: { urlId: urlEntry.id },
    group: ['userAgent'],
    raw: true,
  });

  // Get device type breakdown (based on user agent)
  const deviceType = await db.analytics.findAll({
    attributes: [
      'userAgent',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'uniqueClicks'],
      [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('ip'))), 'uniqueUsers'],
    ],
    where: { urlId: urlEntry.id },
    group: ['userAgent'],
    raw: true,
  });

  return {
    totalClicks,
    uniqueUsers,
    clicksByDate,
    osType,
    deviceType,
  };
};





// Redirect short URL
const redirectShortUrl = async (id) => {
  const urlEntry = await db.dummyUrl.findOne({ where: { id } });

  if (!urlEntry) {
    throw new Error("Short URL not found.");
  }
console.log("urlEntry111111", urlEntry)
  return urlEntry; // Return the full entry including `longUrl`.
};

// Track analytics
const trackAnalytics = async (id, analytics) => {
  const urlEntry = await db.dummyUrl.findOne({ where: { id } });

  if (!urlEntry) {
    throw new Error("Short URL not found.");
  }

  await db.analytics.create({
    id: uuidv4(),
    urlId: urlEntry.id,
    timestamp: analytics.timestamp,
    userAgent: analytics.userAgent,
    ip: analytics.ip,
  });
};





module.exports = { createShortUrl, redirectShortUrl, trackAnalytics };
