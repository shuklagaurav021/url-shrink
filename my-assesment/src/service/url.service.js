const { v4: uuidv4 } = require("uuid");

const createShortUrl = (longUrl, customAlias, topic) => {
    if (!longUrl) {
        throw new Error("Long URL is required");
    }

    const baseUrl = "http://localhost:3002"; 
    const shortId = customAlias || uuidv4().slice(0, 8); 
    const shortUrl = `${baseUrl}/${shortId}`;
    
    const newShortUrl = {
        id: uuidv4(),
        longUrl,
        shortUrl,
        topic: topic || "general",
        createdAt: new Date().toISOString(),
    };

    // Save to database (implement your database logic here)
    console.log("Short URL created:", newShortUrl);

    return newShortUrl;
};

module.exports = { createShortUrl };
