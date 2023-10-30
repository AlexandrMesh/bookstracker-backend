const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

const dbName = process.env.NODE_ENV === 'production' ? 'bookboard' : 'bookboard_dev';
const db2 = `mongodb://admin:${encodeURIComponent('JDASD&#ASDgsdds')}@185.12.94.36:27017/${dbName}?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`

mongoose.connect(db2, {serverSelectionTimeoutMS: 5000});
const connection = mongoose.connection;
connection.on('error', () => {
  console.error.bind(console, 'connection error:');
  // setTimeout(() => {
  //   mongoose.connect(db2, {serverSelectionTimeoutMS: 5000});
  // }, 5000);
});
connection.on('disconnected', () => {
  console.log('Lost MongoDB connection...');
  // setTimeout(() => {
  //   mongoose.connect(db2, {serverSelectionTimeoutMS: 5000});
  // }, 5000);
});
connection.on('connected', async () => {
  console.log('Connected to mongoDb');
});

module.exports = connection;
