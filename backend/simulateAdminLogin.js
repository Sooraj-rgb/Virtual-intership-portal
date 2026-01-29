const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Admin = require("./models/Admin");

async function simulateLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/internship_portal");
    
    console.log("🔍 Simulating admin login with correct credentials...\n");
    
    const email = "ajay.admin@internship.com";
    const password = "Ajay@12345";
    
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);
    
    // Step 1: Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log("❌ Step 1 FAILED: Admin not found in database");
      process.exit(1);
    }
    console.log("✅ Step 1 PASSED: Admin found");
    console.log(`   Admin ID: ${admin._id}`);
    console.log(`   Admin name: ${admin.name}`);
    console.log(`   Admin stored email: ${admin.email}\n`);
    
    // Step 2: Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      console.log("❌ Step 2 FAILED: Password does not match");
      process.exit(1);
    }
    console.log("✅ Step 2 PASSED: Password matches\n");
    
    // Step 3: Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log(`JWT_SECRET available: ${JWT_SECRET ? '✅ YES' : '❌ NO'}`);
    
    if (!JWT_SECRET) {
      console.log("❌ Step 3 FAILED: JWT_SECRET not set");
      process.exit(1);
    }
    
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    console.log(`✅ Step 3 PASSED: JWT token generated`);
    console.log(`   Token: ${token.substring(0, 50)}...\n`);
    
    // Step 4: Prepare response
    const response = {
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
    
    console.log("✅ Step 4 PASSED: Response prepared\n");
    console.log("📤 Full Response:");
    console.log(JSON.stringify(response, null, 2));
    
    console.log("\n✅ LOGIN SIMULATION SUCCESSFUL - Code should work!");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

simulateLogin();
