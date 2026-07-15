require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@chatapp.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@chatapp.com',
    password: 'Admin@123456',
    role: 'admin',
  });

  console.log('✅ Admin created:', admin.email);
  console.log('   Password: Admin@123456  ← Change this immediately!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
