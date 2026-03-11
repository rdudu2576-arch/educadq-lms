import { createAdminUser } from "../server/services/auth.service";

async function main() {
  const email = process.argv[2] || "admin@educadq.com";
  const password = process.argv[3] || "Admin@123456";
  const name = process.argv[4] || "Administrator";

  console.log(`[Admin] Creating admin user...`);
  console.log(`  Email: ${email}`);
  console.log(`  Name: ${name}`);

  try {
    await createAdminUser(email, password, name);
    console.log(`[Admin] ✅ Admin user created successfully!`);
    process.exit(0);
  } catch (error) {
    console.error(`[Admin] ❌ Failed to create admin user:`, error);
    process.exit(1);
  }
}

main();
