// usePose.ts (custom hook for pose detection)

import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { useEffect, useState } from "react";

export function usePoseModel() {
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null
  );

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      setDetector(detector);
    };

    loadModel();
  }, []);

  return detector;
}
