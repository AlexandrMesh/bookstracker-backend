const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000});
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.on('connected', async () => {
  console.log('Connected to mongoDb');
});

module.exports = connection;
