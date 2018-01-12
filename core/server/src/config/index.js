module.exports = {
  database: {
    host: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    location: process.env.DATABASE_LOCATION
  }
};
