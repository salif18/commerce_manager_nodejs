const redis = require("redis")

const client = redis.createClient({
    url: process.env.REDIS_URL // Assurez-vous que cette variable est définie
  });
  
  client.on('error', (err) => {
    console.error('Redis error: ', err);
  });
  
  module.exports = client;