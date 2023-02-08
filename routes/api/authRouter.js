const express = require("express");
const router = express.Router();

const {
  ctrlSignup,
  ctrlLogin,
  ctrlCurrent,
  ctrlLogout,
  ctrlUpdateCurrent,
  ctrlUpdateAvatar,
} = require("../../controllers/authControllers");

const {
  addSignupValidation,
  addLoginValidation,
  addSubscriptionValidation,
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

module.exports = router;
