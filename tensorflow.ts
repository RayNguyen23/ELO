import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";

export async function loadTensorflow() {
  await tf.ready();
}
