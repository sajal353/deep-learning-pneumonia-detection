import * as tf from "@tensorflow/tfjs";
import * as tfNode from "@tensorflow/tfjs-node";
import Jimp from "jimp";

const dir = __dirname;

const predict = async (file: any) => {
  const model = await tf.loadLayersModel(`file://${dir}/model/model.json`);

  let imageBuffer: any;
  let resizedImage: any;

  await Jimp.read(file).then(async (file: any) => {
    resizedImage = file.resize(256, 256).quality(100);
    imageBuffer = await resizedImage.getBufferAsync(Jimp.MIME_JPEG);
  });

  const image = tfNode.node.decodeImage(imageBuffer);

  const imageTensor = tf.image
    .resizeBilinear(image, [256, 256])
    .reshape([1, 256, 256, 3]);

  const result: any = model.predict(imageTensor);
  console.log(`Normal Probability: ${result.dataSync()[0] * 100}%`);
  console.log(`Pneumonia Probability: ${result.dataSync()[1] * 100}%`);
};

predict("./dataset/val/PNEUMONIA/person1950_bacteria_4881.jpeg");
