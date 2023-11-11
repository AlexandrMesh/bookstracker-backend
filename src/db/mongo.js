const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

const dbName = process.env.NODE_ENV === 'production' ? 'bookdesk' : 'bookdesk_dev';
const db2 = `mongodb://adminPeshka:${encodeURIComponent('JDASD&#ASDgsdds')}@91.240.254.163/${dbName}?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`

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
