const axios = require('axios');

const updateService = axios.create({
  timeout: 3000,
  proxy: false,
  baseURL: 'http://localhost:3000/',
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  validateStatus: (status) => status < 500,
});

updateService.baseURL = 'http://localhost:3000/';

module.exports = updateService;
