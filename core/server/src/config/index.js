module.exports = {
  database: {
    host: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER || 'coinolio',
    password: process.env.DATABASE_PASSWORD,
    location: process.env.DATABASE_LOCATION || 'coinolio'
  },
  currency: process.env.CURRENCY || 'USD'
};
