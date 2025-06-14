import { supabase } from '../../lib/supabase.ts';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'deck_images';

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  if (!file || !userId) {
    throw new Error('A file and user ID must be provided to upload an image.');
  }

  const fileExtension = file.name.split('.').pop();
  const newFileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${userId}/${newFileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return data.path;
};

export const deleteImage = async (storagePath: string): Promise<void> => {
  if (!storagePath) {
    throw new Error('A storage path must be provided to delete an image.');
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

export const getPublicUrl = (storagePath: string): string | null => {
  if (!storagePath) return null;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return data?.publicUrl || null;
};
