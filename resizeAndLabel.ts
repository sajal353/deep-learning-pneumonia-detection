import Jimp from "jimp";
import fs from "fs";

const fsPromises = fs.promises;

const trainSet0 = "./dataset/train/NORMAL/";
const trainSet1 = "./dataset/train/PNEUMONIA/";
const trainData = "./dataset/train/trainData/";

const testSet0 = "./dataset/test/NORMAL/";
const testSet1 = "./dataset/test/PNEUMONIA/";
const testData = "./dataset/test/testData/";

const MAX_IMAGES = 1000;

const resizeAndLabelSet = async (
  inputDir: string,
  outputDir: string,
  label: number | string
) => {
  return new Promise(async (resolve, reject) => {
    let i: number = 0;
    const files: Array<string> = await fsPromises.readdir(inputDir);
    for (const file of files) {
      if (i === MAX_IMAGES) {
        break;
      }
      await Jimp.read(inputDir + file)
        .then((file: any) => {
          return file
            .resize(256, 256)
            .quality(100)
            .write(`${outputDir}${i}-${label}.jpeg`);
        })
        .then(() => {
          console.log(
            `${
              inputDir + file
            } processed. Output: ${outputDir}${i}-${label}.jpeg`
          );
        })
        .catch((err: any) => {
          console.error(`Error: ${err}`);
          reject(err);
        });
      console.log(
        `File: ${file}, Count: ${i + 1}/${
          files.length
        }, Percentage: ${parseFloat(
          (((i + 1) / files.length) * 100).toString()
        ).toFixed(2)}%`
      );
      i++;
    }
    console.log(`${inputDir} processed and save into ${outputDir}`);
    resolve(void 0);
  });
};

const resizeAndLabel = async () => {
  await resizeAndLabelSet(trainSet0, trainData, 0);
  await resizeAndLabelSet(trainSet1, trainData, 1);
  await resizeAndLabelSet(testSet0, testData, 0);
  await resizeAndLabelSet(testSet1, testData, 1);
};

resizeAndLabel();
