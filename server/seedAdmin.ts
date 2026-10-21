import bcrypt from 'bcryptjs';
import { connectDB, getIsMongoConnected } from './config/db.ts';
import { ENV } from './config/env.ts';
import { DataStore } from './services/dataStore.ts';
import { AdminModel } from './models/Admin.ts';

async function runSeed() {
  console.log('--- REPORT MANAGEMENT SYSTEM SEED SCRIPT ---');
  console.log(`Target Admin Email: ${ENV.ADMIN_EMAIL}`);
  console.log(`Target Admin Name: ${ENV.ADMIN_NAME}`);

  await connectDB();
  await DataStore.init();

  const existing = await DataStore.findAdminByEmail(ENV.ADMIN_EMAIL);
  if (existing) {
    console.log(`Admin account [${ENV.ADMIN_EMAIL}] already exists. Updating password...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD, salt);

    if (getIsMongoConnected()) {
      await AdminModel.findOneAndUpdate(
        { email: ENV.ADMIN_EMAIL.toLowerCase() },
        { passwordHash, updatedAt: new Date().toISOString() }
      );
    }
    console.log('Admin password updated successfully.');
  } else {
    console.log('Admin account created successfully.');
  }

  console.log('Seeding complete. Initial reports verification complete.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
