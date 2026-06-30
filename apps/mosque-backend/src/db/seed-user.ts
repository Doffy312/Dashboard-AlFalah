import { auth } from "../config/auth.js";

async function seedUser() {
  console.log("🌱 Seeding Admin User...");
  try {
    // We create a mock request object if better-auth requires it for signUpEmail
    const response = await auth.api.signUpEmail({
      body: {
        email: "admin_alfalah@example.com",
        password: "password123",
        name: "Admin Al-Falah",
        role: "Ketua",
      },
    });
    
    console.log("✅ User created successfully!");
    console.log(response.user);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed user:", error);
    process.exit(1);
  }
}

seedUser();
