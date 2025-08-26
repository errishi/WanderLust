const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const { userSignup, userLogin, renderSignupForm, renderLoginForm, logout } = require("../controllers/users.js");

router.route("/signup").get(renderSignupForm).post(wrapAsync(userSignup));

router.route("/login").get(renderLoginForm).post(saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userLogin);

router.get("/logout", logout);

module.exports = router;