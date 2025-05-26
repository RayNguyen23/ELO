import { supabase } from "@/config/initSupabase";

export async function REMOVE(
  DbName: string,
  key: string,
  value: string | number
) {
  const { data, error } = await supabase.from(DbName).delete().eq(key, value); // dynamically match by any column

  if (error) {
    console.error("Supabase delete error:", error);
    throw error;
  }

  return data;
}

export async function REMOVE_BY_UUID_AND_URL(
  DbName: string,
  uuid: string,
  imageUrl: string
) {
  const { data, error } = await supabase
    .from(DbName)
    .delete()
    .match({ uuid: uuid, ImageUrl: imageUrl }); // delete where both match

  if (error) {
    console.error("Supabase delete error:", error);
    throw error;
  }

  return data;
}
