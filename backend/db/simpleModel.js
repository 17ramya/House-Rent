/**
 * A tiny, dependency-free stand-in for a Mongoose model.
 *
 * The controllers were written against the Mongoose API (`findOne`, `find`,
 * `findById`, `new Model(data)`, `doc.save()`, `findByIdAndUpdate`,
 * `findOneAndUpdate`, `findByIdAndDelete`, `create`) and are left untouched.
 * Each schema file exports a Mongoose model locally and one of these in the
 * built-in simple-database mode, so the exact same code runs on either.
 *
 * Documents are kept in memory and mirrored to a JSON file, one file per
 * collection, under config/databaseMode.js's simpleDbDir(). Reads are served
 * from memory; every write rewrites its file. On Vercel that directory is
 * `/tmp`, which is wiped when an instance is recycled - good enough to demo
 * sign up / sign in / admin, not a permanent store (see README.md).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { simpleDbDir } = require("../config/databaseMode");

// A 24 character hex id, the shape a MongoDB ObjectId also has, so ids printed
// in the admin tables look the same in either mode.
const newId = () => crypto.randomBytes(12).toString("hex");

// One array of plain documents per collection, loaded from disk on first use.
const cache = new Map();

const fileFor = (name) => path.join(simpleDbDir(), `${name}.json`);

const load = (name) => {
  if (cache.has(name)) return cache.get(name);

  let docs = [];
  try {
    const parsed = JSON.parse(fs.readFileSync(fileFor(name), "utf8"));
    if (Array.isArray(parsed)) docs = parsed;
  } catch (error) {
    docs = [];
  }

  cache.set(name, docs);
  return docs;
};

const persist = (name) => {
  try {
    fs.mkdirSync(simpleDbDir(), { recursive: true });
    fs.writeFileSync(fileFor(name), JSON.stringify(load(name), null, 2));
  } catch (error) {
    // /tmp can vanish between requests and a local read-only checkout cannot be
    // written to at all: keep the data in memory for this instance rather than
    // failing the request.
    console.warn(`Simple DB: could not write "${name}" (${error.message})`);
  }
};

// Query values arrive as strings (`{ _id: "..." }`, `{ email: "..." }`) while
// the stored value may be any scalar, so compare as text.
const matches = (doc, query) => {
  if (!query) return true;
  return Object.keys(query).every((key) => String(doc[key]) === String(query[key]));
};

// The controllers call both `findById(id)` and `findById({ _id: id })`.
const idOf = (idOrQuery) =>
  idOrQuery && typeof idOrQuery === "object" ? idOrQuery._id : idOrQuery;

/**
 * What `new Model(data)` and every read return. `save()` writes the document
 * back to its collection. Methods live on the prototype and the reference to
 * the collection is non-enumerable, so `JSON.stringify(doc)` and `res.send(doc)`
 * produce exactly the stored fields - no `save`, no `_store`.
 */
class SimpleDocument {
  constructor(data, store) {
    Object.assign(this, data);
    if (this._id === undefined || this._id === null) this._id = newId();
    Object.defineProperty(this, "_store", {
      value: store,
      enumerable: false,
      writable: true,
    });
  }

  async save() {
    this._store.upsert(this);
    return this;
  }

  set(key, value) {
    this[key] = value;
    return this;
  }

  async remove() {
    this._store.removeById(this._id);
  }

  toObject() {
    return { ...this };
  }
}

const createSimpleModel = (name, options = {}) => {
  const transform = options.transform || ((data) => data);

  const store = {
    name,
    all: () => load(name),
    upsert(doc) {
      const list = load(name);
      const index = list.findIndex((row) => String(row._id) === String(doc._id));
      const plain = {};
      Object.keys(doc).forEach((key) => {
        plain[key] = doc[key];
      });
      if (index === -1) list.push(plain);
      else list[index] = plain;
      persist(name);
      return plain;
    },
    removeById(id) {
      const list = load(name);
      const index = list.findIndex((row) => String(row._id) === String(id));
      if (index === -1) return null;
      const [removed] = list.splice(index, 1);
      persist(name);
      return removed;
    },
    clear() {
      cache.set(name, []);
      persist(name);
    },
    seed(rows) {
      if (load(name).length > 0) return false;
      const list = load(name);
      rows.forEach((row) => {
        const doc = { ...row };
        if (doc._id === undefined) doc._id = newId();
        list.push(doc);
      });
      persist(name);
      return true;
    },
  };

  // Callable with or without `new`, mirroring `new userSchema(data)`.
  function Model(data) {
    return new SimpleDocument(transform({ ...data }), store);
  }

  Model.findOne = async (query) => {
    const found = store.all().find((doc) => matches(doc, query));
    return found ? new SimpleDocument(found, store) : null;
  };

  Model.find = async (query) =>
    store
      .all()
      .filter((doc) => matches(doc, query))
      .map((doc) => new SimpleDocument(doc, store));

  Model.findById = async (idOrQuery) => Model.findOne({ _id: idOf(idOrQuery) });

  Model.create = async (data) => {
    const doc = new SimpleDocument(transform({ ...data }), store);
    await doc.save();
    return doc;
  };

  Model.findByIdAndUpdate = async (idOrQuery, update, options = {}) => {
    const id = idOf(idOrQuery);
    const found = store.all().find((doc) => String(doc._id) === String(id));
    if (!found) return null;

    const before = { ...found };
    Object.assign(found, update);
    persist(name);

    return new SimpleDocument(options.new ? found : before, store);
  };

  Model.findOneAndUpdate = async (query, update, options = {}) => {
    const found = store.all().find((doc) => matches(doc, query));
    if (!found) return null;

    const before = { ...found };
    Object.assign(found, update);
    persist(name);

    return new SimpleDocument(options.new ? found : before, store);
  };

  Model.findByIdAndDelete = async (idOrQuery) => {
    const removed = store.removeById(idOf(idOrQuery));
    return removed ? new SimpleDocument(removed, store) : null;
  };

  Model.countDocuments = async (query) =>
    store.all().filter((doc) => matches(doc, query)).length;

  Model.deleteMany = async () => {
    store.clear();
    return { acknowledged: true };
  };

  // Used by db/seed.js and scripts/createAdmin.js; not part of the Mongoose API.
  Model._store = store;

  return Model;
};

module.exports = createSimpleModel;
module.exports.SimpleDocument = SimpleDocument;

