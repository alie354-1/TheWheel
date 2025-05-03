import { supabase } from '../src/lib/supabase'; // Use the app's Supabase client
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function makeUserAdmin(userId: string) {
  if (!userId) {
    console.error('Error: Please provide a user ID as a command-line argument.');
    process.exit(1);
  }

  console.log(`Attempting to set role='admin' for user ID: ${userId}`);

  try {
    const { data, error } = await supabase
      .from('users') // Target the 'users' table
      .update({ role: 'admin' }) // Set the role field to 'admin'
      .eq('id', userId) // Match the provided user ID
      .select() // Select the updated record to confirm
      .single(); // Expect only one record

    if (error) {
      console.error(`Error updating user role for ${userId}:`, error.message);
      throw error;
    }

    if (data) {
      console.log(`Successfully updated user ${userId}. New role: ${data.role}`);
    } else {
      console.warn(`User with ID ${userId} not found or no update occurred.`);
    }

  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userIdToUpdate = process.argv[2];

makeUserAdmin(userIdToUpdate);
