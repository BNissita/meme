const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hireme-ai', {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`
[TIP] MongoDB is likely not running on your local machine.
- On Windows: Run PowerShell as Admin and execute: Start-Service MongoDB
- Or configure a remote cluster: Add your MongoDB Atlas connection string to 'MONGO_URI' in backend/.env
`);
    process.exit(1);
  }
};

module.exports = connectDB;
