const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://kumawatsubhash388:rJR0SsChhjeK4V7t@cluster2.drkdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2'
, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open', () => console.log('✅ MongoDB connected successfully'));

db.on('error', (err) => console.error('❌ MongoDB connection error:', err));

db.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));

module.exports = db;
