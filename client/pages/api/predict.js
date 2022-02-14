import * as tf from "@tensorflow/tfjs";
import { decodeImage } from "@tensorflow/tfjs-node/dist/image";
import Jimp from "jimp";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function predict(req, res) {
  const method = req.method;

  if (method === "POST") {
    try {
      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: err,
          });
        }

        const img = files.image;

        if (!img) {
          res.status(400).json({
            success: false,
            message: "No image provided",
          });
        }
        const model = await tf.loadLayersModel(
          `http://localhost:3000/model.json`
        );

        let imageBuffer;
        let resizedImage;

        await Jimp.read(img.filepath).then(async (file) => {
          resizedImage = file.resize(256, 256).quality(100);
          imageBuffer = await resizedImage.getBufferAsync(Jimp.MIME_JPEG);
        });

        const image = decodeImage(imageBuffer);

        const imageTensor = tf.image
          .resizeBilinear(image, [256, 256])
          .reshape([1, 256, 256, 3]);

        const result = model.predict(imageTensor);
        console.log(`Normal Probability: ${result.dataSync()[0] * 100}%`);
        console.log(`Pneumonia Probability: ${result.dataSync()[1] * 100}%`);

        res.status(200).json({
          success: true,
          data: {
            normal: parseFloat(result.dataSync()[0] * 100).toFixed(3),
            pneumonia: parseFloat(result.dataSync()[1] * 100).toFixed(3),
          },
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error" + error.message || error,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }
}
