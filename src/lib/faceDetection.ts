import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;

export const initializeFaceLandmarker = async () => {
  if (faceLandmarker) return faceLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    numFaces: 1,
    runningMode: "IMAGE",
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });

  return faceLandmarker;
};

export const detectFaceLandmarks = async (image: HTMLImageElement) => {
  const landmarker = await initializeFaceLandmarker();
  
  // Ensure image is fully loaded and has valid dimensions
  if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
    console.log("Image not ready:", { 
      complete: image.complete, 
      width: image.naturalWidth, 
      height: image.naturalHeight 
    });
    throw new Error("Image not fully loaded");
  }

  console.log("Detecting face in image:", { 
    width: image.naturalWidth, 
    height: image.naturalHeight,
    src: image.src.substring(0, 50) 
  });

  const results = landmarker.detect(image);
  
  console.log("Detection results:", {
    faceLandmarksCount: results.faceLandmarks?.length || 0,
    faceBlendshapesCount: results.faceBlendshapes?.length || 0
  });
  
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    throw new Error("No face detected - try a clearer photo with better lighting and face directly visible");
  }

  return results.faceLandmarks[0];
};

// Lip indices from MediaPipe Face Mesh
export const LIP_INDICES = {
  upper: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  lower: [146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  outer: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185],
};

// Cheek indices for blush
export const CHEEK_INDICES = {
  left: [116, 117, 118, 119, 100, 142, 36, 205, 206],
  right: [345, 346, 347, 348, 329, 371, 266, 425, 426],
};

// Eye indices for eyeshadow
export const EYE_INDICES = {
  left: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  right: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
};
