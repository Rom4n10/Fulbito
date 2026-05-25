import type { SupabaseClient } from "@supabase/supabase-js";

// Keep track of the last run timestamp in serverless instance memory
let lastCleanTime = 0;
const CLEAN_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Runs the `update_expired_matches` RPC call on Supabase.
 * Throttles execution to a maximum of once every 10 minutes, and triggers it
 * asynchronously (non-blocking) so the user's initial feed load is not delayed.
 */
export function cleanMatchesIfNeeded(supabase: SupabaseClient) {
  const now = Date.now();
  
  if (now - lastCleanTime > CLEAN_INTERVAL) {
    lastCleanTime = now;
    
    // Execute asynchronously (non-blocking) using an async IIFE to be fully TypeScript compliant
    (async () => {
      try {
        await supabase.rpc("update_expired_matches");
        console.log("Background match cleanup: update_expired_matches executed successfully.");
      } catch (err) {
        console.error("Background match cleanup failed:", err);
      }
    })();
  }
}
