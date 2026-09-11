const express= require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const {storage} = require("../CloudConfig.js");
const upload = multer({ storage });
//here we define our path only once
//index Route 
//create  new listing route
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, validateListing,upload.single("listing[image]"), wrapAsync(listingController.createListing));


//create new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//now we use router.route for /:id
//show route
//update edited data 
//delete route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//edit route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditListing));


module.exports = router;