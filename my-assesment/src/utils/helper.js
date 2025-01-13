const { v4: uuidv4 } = require("uuid");

const generateUniqueId = () => uuidv4();

const validateTaskData = (data) => {
  return data.title && data.description;
};

module.exports = { generateUniqueId, validateTaskData };