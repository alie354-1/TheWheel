import { supabase } from "../supabase";

export const journeyContentService = {
  async getAllStepTemplates() {
    const { data, error } = await supabase.from("step_templates").select("*").order("id");
    if (error) throw error;
    return data;
  },

  async upsertStepTemplate(template) {
    const { data, error } = await supabase.from("step_templates").upsert(template).select();
    if (error) throw error;
    return data;
  },

  async deleteStepTemplate(id) {
    const { error } = await supabase.from("step_templates").delete().eq("id", id);
    if (error) throw error;
  }
};
