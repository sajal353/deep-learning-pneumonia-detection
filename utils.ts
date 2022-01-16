const fs = require("fs");
const fsPromises = fs.promises;
const tfNode = require("@tensorflow/tfjs-node");

export const generateFeatureTensor = async (image: string) => {
  const imageBuffer = await fsPromises.readFile(image);
  return tfNode.node.decodeImage(imageBuffer);
};
