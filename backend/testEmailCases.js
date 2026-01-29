const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Admin = require("./models/Admin");

async function testDifferentCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/internship_portal");
    
    const testCases = [
      { email: "ajay.admin@internship.com", password: "Ajay@12345" },
      { email: "AJAY.ADMIN@INTERNSHIP.COM", password: "Ajay@12345" },
      { email: "Ajay.Admin@Internship.Com", password: "Ajay@12345" }
    ];
    
    for (const test of testCases) {
      console.log(`\n🔍 Testing: ${test.email}`);
      
      // Test exact match (current code)
      const exact = await Admin.findOne({ email: test.email });
      console.log(`  Exact match: ${exact ? '✅ FOUND' : '❌ NOT FOUND'}`);
      
      // Test lowercase match (proposed fix)
      const lower = await Admin.findOne({ email: test.email.toLowerCase() });
      console.log(`  Lowercase match: ${lower ? '✅ FOUND' : '❌ NOT FOUND'}`);
      
      if (lower) {
        const isMatch = await bcrypt.compare(test.password, lower.password);
        console.log(`  Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

testDifferentCases();
