const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");

//for render signup form
// signup
router.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.userSignUp));

// for login
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}),wrapAsync(userController.userLogin));

//logout route
router.get("/logout", userController.userLogOut);


module.exports = router;