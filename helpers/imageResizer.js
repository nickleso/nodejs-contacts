const Jimp = require("jimp");

const resizedAvatar = async (resultUpload) => {
  const image = await Jimp.read(resultUpload);

  try {
    image.resize(250, 250);
    image.write(resultUpload);

    return resultUpload;
  } catch (error) {
    console.log(error);
  }
};

module.exports = resizedAvatar;
