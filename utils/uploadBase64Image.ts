import { supabase } from "@/config/initSupabase";

export async function uploadBase64Image(base64: string) {
  try {
    const cleanedBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(cleanedBase64), (c) => c.charCodeAt(0));

    const fileName = `images/${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from("files")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    const publicURL = urlData.publicUrl; // here is the fix
    console.log(publicURL);

    return publicURL;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
