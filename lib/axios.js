const axios = require("axios");
require('dotenv').config()

const axiosInstance = axios.create({
    baseURL: process.env.MICROSERVICE_BASE_URL,
    params: {
        api_key: process.env.API_KEY
    },
    headers: {
        Authorization: `Bearer ${process.env.API_ACCESS_TOKEN}`,
    }
})

module.exports = axiosInstance;