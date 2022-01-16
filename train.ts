import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import { generateFeatureTensor } from "./utils";

const fsPromises = fs.promises;
const dir = __dirname;

const trainData = "./dataset/train/trainData/";
const testData = "./dataset/test/testData/";
const NUM_OF_CLASSES = 2;

const train = async () => {
  try {
    let featureArray: Array<any> = [];
    let labelArray: Array<any> = [];
    let testFeatureArray: Array<any> = [];
    let testLabelArray: Array<any> = [];

    const trainFiles: Array<string> = await fsPromises.readdir(trainData);

    console.log(
      `Total training files: ${trainFiles.length} with ${NUM_OF_CLASSES} classes. Resizing and Creating Features and Labels...`
    );

    for (const file of trainFiles) {
      const feature = await generateFeatureTensor(trainData + file);
      const label = file.split("-")[1].split(".")[0];
      featureArray.push(feature);
      labelArray.push(label);
    }

    const testFiles: Array<string> = await fsPromises.readdir(testData);

    console.log(
      `Total testing files: ${testFiles.length} with ${NUM_OF_CLASSES} classes. Resizing and Creating Features and Labels...`
    );

    for (const file of testFiles) {
      const feature = await generateFeatureTensor(trainData + file);
      const label = file.split("-")[1].split(".")[0];
      testFeatureArray.push(feature);
      testLabelArray.push(label);
    }

    console.log(`Resizing complete. Features and Labels created.`);
    console.log(`Creating Tensors with One-Hot Label Array...`);

    let tensorFeatures = tf.stack(featureArray);
    let tensorLabels = tf.oneHot(
      tf.tensor1d(labelArray, "int32"),
      NUM_OF_CLASSES
    );

    let testTensorFeatures = tf.stack(testFeatureArray);
    let testTensorLabels = tf.oneHot(
      tf.tensor1d(testLabelArray, "int32"),
      NUM_OF_CLASSES
    );

    console.log(`Tensors created.`);
    console.log(`Creating Model...`);

    const model = tf.sequential();

    model.add(
      tf.layers.conv2d({
        inputShape: [256, 256, 3],
        strides: 1,
        padding: "same",
        filters: 32,
        kernelSize: [3, 3],
        activation: "relu",
      })
    );

    model.add(tf.layers.batchNormalization());
    model.add(
      tf.layers.maxPooling2d({ poolSize: [2, 2], strides: 2, padding: "same" })
    );
    model.add(
      tf.layers.conv2d({
        strides: 1,
        padding: "same",
        filters: 64,
        kernelSize: [3, 3],
        activation: "relu",
      })
    );
    model.add(tf.layers.dropout({ rate: 0.1 }));
    model.add(tf.layers.batchNormalization());
    model.add(
      tf.layers.maxPooling2d({ poolSize: [2, 2], strides: 2, padding: "same" })
    );
    model.add(
      tf.layers.conv2d({
        strides: 1,
        padding: "same",
        filters: 64,
        kernelSize: [3, 3],
        activation: "relu",
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(
      tf.layers.maxPooling2d({ poolSize: [2, 2], strides: 2, padding: "same" })
    );
    model.add(
      tf.layers.conv2d({
        strides: 1,
        padding: "same",
        filters: 128,
        kernelSize: [3, 3],
        activation: "relu",
      })
    );
    model.add(tf.layers.dropout({ rate: 0.2 }));

    model.add(tf.layers.batchNormalization());
    model.add(
      tf.layers.maxPooling2d({ poolSize: [2, 2], strides: 2, padding: "same" })
    );
    model.add(
      tf.layers.conv2d({
        strides: 1,
        padding: "same",
        filters: 256,
        kernelSize: [3, 3],
        activation: "relu",
      })
    );
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.batchNormalization());
    model.add(
      tf.layers.maxPooling2d({ poolSize: [2, 2], strides: 2, padding: "same" })
    );
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 128, activation: "relu" }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(
      tf.layers.dense({ units: NUM_OF_CLASSES, activation: "sigmoid" })
    );

    model.compile({
      optimizer: tf.train.adam(),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });

    model.summary();

    console.log(`Model created.`);
    console.log(`Training Model...`);

    await model.fit(tensorFeatures, tensorLabels, {
      epochs: 5,
      batchSize: 32,
      validationSplit: 0.1,
    });

    const result: any = model.evaluate(testTensorFeatures, testTensorLabels, {
      batchSize: 32,
    });

    result.forEach((value: any, index: any) => {
      console.log(`${model.metricsNames[index]}: ${value}`);
    });

    await model.save(`file://${dir}/model`);
    console.log(`Model trained and saved.`);
  } catch (error) {
    console.log(error);
  }
};

train();
