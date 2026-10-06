/**
 * Seeds the built-in simple database with the administrator account the
 * /adminhome pages need.
 *
 * The public register form only offers Renter and Owner (see
 * frontend/src/modules/common/Register.jsx) and login routes `type: "Admin"`
 * to /adminhome, so without this a deployment that has no MongoDB would have
 * no admin to sign in with. The account is created once, the first time the
 * deployment answers a request, and survives for the life of the instance
 * (see "Simple database" in README.md).
 *
 *   ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME  override the defaults below.
 */
const bcrypt = require("bcryptjs");

const { useSimpleDb } = require("../config/databaseMode");
const userSchema = require("../schemas/userModel");

const DEFAULT_ADMIN = {
  name: "Site Admin",
  email: "admin@renteasy.com",
  password: "Admin@123",
};

const seedSimpleDb = () => {
  if (!useSimpleDb()) return;

  const store = userSchema._store;
  if (!store) return;

  // Never overwrite accounts that a real run has already created.
  if (store.all().some((user) => user.type === "Admin")) return;

  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN.email;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password;
  const name = process.env.ADMIN_NAME || DEFAULT_ADMIN.name;

  store.seed([
    {
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      type: "Admin",
      granted: "granted",
    },
  ]);

  console.log(
    `Simple DB: seeded the admin account ${email}. Sign in at /login to reach /adminhome.`
  );
};

module.exports = seedSimpleDb;
