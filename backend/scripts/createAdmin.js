/**
 * Creates (or resets) the administrator account that the /adminhome pages need.
 *
 * The public register form only offers Renter and Owner, while login sends
 * `type: "Admin"` to /adminhome - so an admin can only be created here.
 *
 *   cd backend
 *   npm run create-admin -- admin@renteasy.com Admin@123 "Site Admin"
 *
 * Running it again with the same email resets that account's password, which is
 * also how an admin login is recovered. The email is stored exactly as typed and
 * sign-in compares it exactly, so keep the same capitalisation.
 */
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectionOfDb = require("../config/connect");
const userSchema = require("../schemas/userModel");

dotenv.config();

const [email, password, name = "Site Admin"] = process.argv.slice(2);

const createAdmin = async () => {
  if (!email || !password) {
    console.error(
      'Usage: npm run create-admin -- <email> <password> ["Full Name"]'
    );
    process.exit(1);
  }

  const uri = connectionOfDb.databaseUri();
  if (!uri) {
    console.error(
      "MONGO_DB is not set. Add it to backend/.env (local) or to the Vercel " +
        "project's Environment Variables, then run this again."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const existingAdmin = await userSchema.findOne({ email });

  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.password = hashedPassword;
    existingAdmin.type = "Admin";
    existingAdmin.granted = "granted";
    await existingAdmin.save();
    console.log(`Reset the admin account ${email}.`);
  } else {
    await userSchema.create({
      name,
      email,
      password: hashedPassword,
      type: "Admin",
    });
    console.log(`Created the admin account ${email}.`);
  }

  console.log(
    "Sign in at /login with that email and password - you land on /adminhome."
  );

  await mongoose.disconnect();
};

createAdmin().catch(async (error) => {
  console.error(`Could not create the admin account: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
