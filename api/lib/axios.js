const axios = require('axios');

const axiosInstance = axios.create({
  baseURL: 'http://vdunpaywallmir.intra.inist.fr:8080',
});

module.exports = axiosInstance;
