module.exports = {
  database: {
    host: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER || 'coinolio',
    password: process.env.DATABASE_PASSWORD,
    location: process.env.DATABASE_LOCATION || 'coinolio'
  },
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  currency: process.env.CURRENCY || 'USD',
  jwtSecret: process.env.TOKEN_SECRET
};
