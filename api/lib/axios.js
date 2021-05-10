const axios = require('axios');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
});

module.exports = axiosInstance;
