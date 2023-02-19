const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const gravatar = require("gravatar");
const resizedAvatar = require("../helpers/imageResizer");
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const { uid } = require("uid");
const { User } = require("../models/userModels");
const sendEmail = require("../helpers/sengridEmail");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET;

const ctrlSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        code: 409,
        message: "Email in use",
      });
    }

    const verificationToken = uid();
    const avatarURL = gravatar.url(email);
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    await User.create({
      name,
      email,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const mail = {
      to: email,
      subject: "Email submission",
      html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Submit email</a>`,
    };

    await sendEmail(mail);

    res.json({
      status: "Created",
      code: 201,
      message: "Registration successful and verification email sent",
      data: {
        user: {
          name,
          email,
          avatarURL,
          verificationToken,
        },
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const ctrlLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!user || !user.verify || !validPassword) {
      return res.status(401).json({
        code: 401,
        message: "Email or password is wrong, or email is not verified",
      });
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      status: "success",
      code: 200,
      data: {
        user: {
          email,
        },
        token,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const ctrlCurrent = async (req, res, next) => {
  try {
    const { name, email, subscription } = req.user;

    res.json({
      status: "success",
      code: 200,
      data: {
        user: {
          name,
          email,
          subscription,
        },
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const ctrlLogout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, { token: null });

    if (!user) {
      unauthorized(res);
    }

    res.status(204).json({
      status: "No content",
      code: 204,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const ctrlUpdateCurrent = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const { _id } = req.user;

    await User.findByIdAndUpdate({ _id }, { $set: { subscription } });

    res.json({
      status: "subscription updated",
      code: 200,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const ctrlUpdateAvatar = async (req, res, next) => {
  const { path: tempUpload, originalname } = req.file;
  const { _id: id } = req.user;
  const imageName = `${id}_${originalname}`;

  try {
    const resultUpload = path.join(avatarsDir, imageName);

    await fs.rename(tempUpload, resultUpload);
    await resizedAvatar(resultUpload);

    const avatarURL = path.join("public", "avatars", imageName);

    await User.findByIdAndUpdate(req.user._id, { avatarURL });

    res.json({
      status: "avatar updated",
      code: 200,
      avatar: avatarURL,
    });
  } catch (error) {
    await fs.unlink(tempUpload);

    console.log(error.message);
    next(error);
  }
};

const ctrlVerifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "User not found or email is already verified",
    });
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({
    status: "Verification success",
    code: 200,
  });
};

const ctrlVerifyEmailRepeat = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  const { verificationToken } = user;

  if (!email) {
    return res.status(400).json({
      code: 400,
      message: "Missing required field email",
    });
  }

  if (user.verify) {
    return res.status(400).json({
      code: 400,
      message: "Verification has already been passed",
    });
  }

  const mail = {
    to: email,
    subject: "Email submission",
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Submit email</a>`,
  };

  await sendEmail(mail);

  res.json({
    status: "Ok",
    code: 200,
    message: "Verification email sent",
  });
};

module.exports = {
  ctrlSignup,
  ctrlLogin,
  ctrlCurrent,
  ctrlLogout,
  ctrlUpdateCurrent,
  ctrlUpdateAvatar,
  ctrlVerifyEmail,
  ctrlVerifyEmailRepeat,
};
