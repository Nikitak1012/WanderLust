require("dotenv").config({ path: "./.env" });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}

main().then(() => {
    console.log("Connected to Atlas DB");
}).catch(err => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});
    // NOTE: Replace the owner ID below with your actual user _id from MongoDB Atlas
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6ad1f1f2babd7f9d5fd4d5db",
    }));
    await Listing.insertMany(initData.data);
    console.log("✅ Data initialized successfully with categories!");
};

initDB();