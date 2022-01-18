import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import { generateFeatureTensor } from "./utils";

const fsPromises = fs.promises;
const dir = __dirname;

const testData = "./dataset/test/testData/";
const NUM_OF_CLASSES = 2;

const evaluate = async () => {
  try {
    let testFeatureArray: Array<any> = [];
    let testLabelArray: Array<any> = [];

    const testFiles: Array<string> = await fsPromises.readdir(testData);

    console.log(
      `Total testing files: ${testFiles.length} with ${NUM_OF_CLASSES} classes. Creating Features and Labels...`
    );

    for (const file of testFiles) {
      const feature = await generateFeatureTensor(testData + file);
      const label = file.split("-")[1].split(".")[0];
      testFeatureArray.push(feature);
      testLabelArray.push(label);
    }

    let testTensorFeatures = tf.stack(testFeatureArray);
    let testTensorLabels = tf.oneHot(
      tf.tensor1d(testLabelArray, "int32"),
      NUM_OF_CLASSES
    );

    const model = await tf.loadLayersModel(`file://${dir}/model/model.json`);

    model.compile({
      optimizer: tf.train.adam(),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });

    const testResult: any = await model.evaluate(
      testTensorFeatures,
      testTensorLabels,
      {
        batchSize: 1,
      }
    );

    testResult.forEach((value: any, index: any) => {
      console.log(`${model.metricsNames[index]}: ${value}`);
    });
  } catch (err) {
    console.log(err);
  }
};

evaluate();
