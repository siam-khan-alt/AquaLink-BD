import { connectDB } from "../src/shared/lib/db";
import { User } from "../src/models/User";
import { ExpertConsultant } from "../src/models/ExpertConsultant";

async function migrateExpertsToDoctors() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Fetch all verified experts
    const experts = await ExpertConsultant.find({ isVerified: true });
    console.log(`Found ${experts.length} verified experts to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const expert of experts) {
      try {
        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: expert.email });

        if (existingUser) {
          console.log(`Skipping ${expert.name} - User already exists with email: ${expert.email}`);
          skippedCount++;
          continue;
        }

        // Create new user with doctor role
        const newUser = await User.create({
          name: expert.name,
          email: expert.email,
          phone: expert.phone,
          role: "doctor",
          isVerified: true,
          specialization: expert.specialization,
          image: expert.avatarUrl,
          // Generate a temporary password (user should reset it)
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
          availability: {
            isAvailable: true,
            weeklySchedule: {
              monday: { start: "09:00", end: "17:00" },
              tuesday: { start: "09:00", end: "17:00" },
              wednesday: { start: "09:00", end: "17:00" },
              thursday: { start: "09:00", end: "17:00" },
              friday: { start: "09:00", end: "17:00" },
              saturday: { start: "09:00", end: "13:00" },
              sunday: { start: "", end: "" },
            },
          },
          consultationFee: 500, // Default fee
        });

        console.log(`✓ Migrated ${expert.name} to doctor role (ID: ${newUser._id})`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ Failed to migrate ${expert.name}:`, error);
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Total experts processed: ${experts.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateExpertsToDoctors();
