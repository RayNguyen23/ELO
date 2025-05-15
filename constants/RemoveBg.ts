import axios from "axios";
import { Buffer } from "buffer";

global.Buffer = Buffer;

const REMOVE_BG_API = "https://api.remove.bg/v1.0/removebg";
const API_KEY = process.env.EXPO_PUBLIC_REMOVE_BG_KEY; // Replace with your actual key

export const removeBackground = async (imageUri: string): Promise<string> => {
  const formData = new FormData();

  formData.append("size", "auto");
  formData.append("image_file", {
    uri: imageUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  try {
    const response = await axios.post(REMOVE_BG_API, formData, {
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "multipart/form-data",
      },
      responseType: "arraybuffer", // Important for binary response
    });

    // Convert binary to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      response.data,
      "binary"
    ).toString("base64")}`;

    return base64Image;
  } catch (error: any) {
    console.error(
      "remove.bg API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
