const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Admin = require("./models/Admin");

const admins = [
  {
    name: "ajay",
    email: "ajay.admin@internship.com",
    password: "Ajay@12345"
  },
  {
    name: "farsana",
    email: "farsana.admin@internship.com",
    password: "Farsana@12345"
  },
  {
    name: "anakha",
    email: "anakha.admin@internship.com",
    password: "Anakha@12345"
  },
  {
    name: "arun",
    email: "arun.admin@internship.com",
    password: "Arun@12345"
  }
];

async function seedAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/internship_portal");
    
    console.log("🗑️  Deleting all existing admins...");
    await Admin.deleteMany({});
    console.log("✅ All existing admins deleted");
    
    console.log("👤 Creating 4 admin accounts...");
    
    for (const adminData of admins) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      const admin = new Admin({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword
      });
      
      await admin.save();
      console.log(`✅ Admin created: ${adminData.name} (${adminData.email})`);
    }
    
    console.log("\n📋 Admin Credentials:");
    console.log("================================");
    admins.forEach(admin => {
      console.log(`\nName: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${admin.password}`);
    });
    console.log("\n================================");
    
    console.log("\n✅ Admin seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admins:", err);
    process.exit(1);
  }
}

seedAdmins();
