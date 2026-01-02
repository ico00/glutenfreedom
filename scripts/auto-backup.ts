#!/usr/bin/env tsx
/**
 * Automatski backup skripta
 * Pokreni s: npm run backup
 * Ili dodaj u cron: 0 2 * * * cd /path/to/project && npm run backup
 */

import { createFullBackup, cleanupOldBackups } from "../lib/backup";
import { Logger } from "../lib/logger";

async function main() {
  try {
    console.log("Starting automatic backup...");
    await Logger.info("Automatic backup started");
    
    const result = await createFullBackup();
    
    if (result.success) {
      console.log(`Backup created successfully: ${result.backupPath}`);
      await Logger.info("Automatic backup completed", {
        backupPath: result.backupPath,
      });
      
      // Očisti stare backupove (zadrži zadnjih 20)
      await cleanupOldBackups(20);
      console.log("Old backups cleaned up");
    } else {
      console.error(`Backup failed: ${result.error}`);
      await Logger.error("Automatic backup failed", undefined, {
        error: result.error,
      });
      process.exit(1);
    }
  } catch (error) {
    console.error("Error in backup script:", error);
    await Logger.error("Error in backup script", error);
    process.exit(1);
  }
}

main();

