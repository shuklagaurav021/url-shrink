const db = require("../models"); // Ensure the correct path to models
const { v4: uuidv4 } = require("uuid");
const baseUrl = "http://localhost:3002";

// Create a short URL
const createShortUrl = async (longUrl, customAlias, topic) => {
  const shortId = customAlias || uuidv4().slice(0, 6);
  const shortUrl = `${baseUrl}/api/shorten/${shortId}`;

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

// Redirect short URL
const redirectShortUrl = async (alias) => {
  const shortUrl = `${baseUrl}/api/shorten/${alias}`;
  const urlEntry = await db.dummyUrl.findOne({ where: { shortUrl } });

  if (!urlEntry) {
    throw new Error("Short URL not found.");
  }

  return urlEntry;
};

// Track analytics
const trackAnalytics = async (alias, analytics) => {
  const shortUrl = `${baseUrl}/api/shorten/${alias}`;
  const urlEntry = await db.dummyUrl.findOne({ where: { shortUrl } });

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

// Fetch URL Analytics
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

// Get Topic-Based Analytics
const getTopicAnalytics = async (topic) => {
  // Fetch all URLs for the specified topic
  const urls = await db.dummyUrl.findAll({
    where: { topic },
    raw: true,
  });

  if (urls.length === 0) {
    throw new Error('No URLs found for this topic.');
  }

  let totalClicks = 0;
  let uniqueUsers = new Set();
  const clicksByDate = [];
  const urlsData = [];

  for (const url of urls) {
    const urlAnalytics = await db.analytics.findAll({
      where: { urlId: url.id },
      raw: true,
    });

    // Aggregate clicks by date
    urlAnalytics.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!clicksByDate[date]) {
        clicksByDate[date] = 0;
      }
      clicksByDate[date] += 1;

      // Add unique users (based on IP)
      uniqueUsers.add(entry.ip);
    });

    // Aggregate total clicks for this URL
    totalClicks += urlAnalytics.length;

    urlsData.push({
      shortUrl: url.shortUrl,
      totalClicks: urlAnalytics.length,
      uniqueUsers: new Set(urlAnalytics.map((entry) => entry.ip)).size,
    });
  }

  return {
    totalClicks,
    uniqueUsers: uniqueUsers.size,
    clicksByDate: Object.entries(clicksByDate).map(([date, clickCount]) => ({ date, clickCount })),
    urls: urlsData,
  };
};



const getOverallAnalytics = async (userId) => {
  // Fetch all URLs created by the user (assuming userId is linked to `dummyUrl`)
  const userUrls = await db.dummyUrl.findAll({
    where: { userId },  // Assuming the URL model has a userId field to identify the creator
    raw: true,
  });

  if (userUrls.length === 0) {
    throw new Error('No URLs found for this user.');
  }

  let totalClicks = 0;
  let uniqueUsers = new Set();
  const clicksByDate = [];
  const osType = [];
  const deviceType = [];

  for (const url of userUrls) {
    const urlAnalytics = await db.analytics.findAll({
      where: { urlId: url.id },
      raw: true,
    });

    // Aggregate clicks by date
    urlAnalytics.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!clicksByDate[date]) {
        clicksByDate[date] = 0;
      }
      clicksByDate[date] += 1;

      // Add unique users (based on IP)
      uniqueUsers.add(entry.ip);
    });

    // Aggregate total clicks for this URL
    totalClicks += urlAnalytics.length;

    // OS and Device breakdown logic (similar to other analytics)
    urlAnalytics.forEach((entry) => {
      const os = getOsFromUserAgent(entry.userAgent); 
      const device = getDeviceFromUserAgent(entry.userAgent);  

      osType[os] = osType[os] || { uniqueClicks: 0, uniqueUsers: new Set() };
      osType[os].uniqueClicks += 1;
      osType[os].uniqueUsers.add(entry.ip);

      deviceType[device] = deviceType[device] || { uniqueClicks: 0, uniqueUsers: new Set() };
      deviceType[device].uniqueClicks += 1;
      deviceType[device].uniqueUsers.add(entry.ip);
    });
  }

  return {
    totalUrls: userUrls.length,
    totalClicks,
    uniqueUsers: uniqueUsers.size,
    clicksByDate: Object.entries(clicksByDate).map(([date, clickCount]) => ({ date, clickCount })),
    osType: Object.entries(osType).map(([osName, { uniqueClicks, uniqueUsers }]) => ({ osName, uniqueClicks, uniqueUsers: uniqueUsers.size })),
    deviceType: Object.entries(deviceType).map(([deviceName, { uniqueClicks, uniqueUsers }]) => ({ deviceName, uniqueClicks, uniqueUsers: uniqueUsers.size })),
  };
};

module.exports = { createShortUrl, redirectShortUrl, trackAnalytics, getUrlAnalytics,getTopicAnalytics, getOverallAnalytics };
