const express = require("express");
const router = express.Router();

const {
  ctrlSignup,
  ctrlLogin,
  ctrlCurrent,
  ctrlLogout,
  ctrlUpdateCurrent,
  ctrlUpdateAvatar,
  ctrlVerifyEmail,
  ctrlVerifyEmailRepeat,
} = require("../../controllers/authControllers");

const {
  addSignupValidation,
  addLoginValidation,
  addSubscriptionValidation,
  addEmailValidation,
} = require("../../middlewares/authValidation");

const { auth } = require("../../middlewares/auth");
const upload = require("../../middlewares/upload");

router.post("/signup", addSignupValidation, ctrlSignup);

router.post("/login", addLoginValidation, ctrlLogin);

router.get("/current", auth, ctrlCurrent);

router.patch(
  "/current/subscription",
  auth,
  addSubscriptionValidation,
  ctrlUpdateCurrent
);

router.patch(
  "/current/avatars",
  auth,
  upload.single("avatar"),
  ctrlUpdateAvatar
);

router.get("/logout", auth, ctrlLogout);

router.get("/verify/:verificationToken", ctrlVerifyEmail);

router.post("/verify", addEmailValidation, ctrlVerifyEmailRepeat);

module.exports = router;
