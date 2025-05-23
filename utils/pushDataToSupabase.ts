import { supabase } from "@/config/initSupabase";

export async function PUSH(DbName: string, NewData: Record<string, any>) {
  const { data, error } = await supabase.from(DbName).insert([NewData]);

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }

  return data;
}
