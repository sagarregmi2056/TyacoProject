require("dotenv").config();
const bcrypt = require("bcrypt");
const AdminUser = require("../models/Admin");

const createAdminUser = async () => {
  const existingAdmin = await AdminUser.findOne({
    username: process.env.ADMIN_USERNAME,
  });
  if (existingAdmin) {
    console.log("Admin user already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  const newAdmin = new AdminUser({
    username: process.env.ADMIN_USERNAME,
    password: hashedPassword,
    role: "admin",
  });

  await newAdmin.save();
  console.log("Admin user created successfully.");
};

module.exports = createAdminUser;
