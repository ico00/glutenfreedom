import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createFullBackup, cleanupOldBackups } from "@/lib/backup";

export async function POST() {
  try {
    // Provjeri autentifikaciju
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Kreiraj backup
    const result = await createFullBackup();
    
    if (!result.success) {
      return NextResponse.json(
        { message: "Error creating backup", error: result.error },
        { status: 500 }
      );
    }

    // Očisti stare backupove (zadrži zadnjih 10)
    await cleanupOldBackups(10);

    return NextResponse.json({
      message: "Backup created successfully",
      backupPath: result.backupPath,
    });
  } catch (error) {
    console.error("Error in backup endpoint:", error);
    return NextResponse.json(
      { message: "Error creating backup" },
      { status: 500 }
    );
  }
}

