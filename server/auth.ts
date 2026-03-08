import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db } from "./db";
import { sql } from "drizzle-orm";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function getStoredPasswordHash(): Promise<string | null> {
  try {
    const result = await db.execute(
      sql`SELECT value FROM admin_settings WHERE key = 'admin_password_hash' LIMIT 1`
    );
    const rows = result.rows as any[];
    if (rows.length > 0) {
      return rows[0].value;
    }
  } catch {
    // Table may not exist yet during initial startup
  }
  return null;
}

async function verifyPassword(password: string): Promise<boolean> {
  // First check if there's a password stored in the database (changed via admin panel)
  const storedHash = await getStoredPasswordHash();
  if (storedHash) {
    return hashPassword(password) === storedHash;
  }
  // Fall back to environment variable
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return false;
  return password === envPassword;
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export function registerAuthRoutes(app: any) {
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { password } = req.body;

    const valid = await verifyPassword(password);
    if (valid) {
      (req.session as any).isAdmin = true;
      return res.json({ isAdmin: true });
    }

    return res.status(401).json({ message: "Invalid password" });
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (req.session && (req.session as any).isAdmin) {
      return res.json({ isAdmin: true });
    }
    return res.status(401).json({ message: "Not authenticated" });
  });

  // Change password endpoint (requires current auth)
  app.post("/api/admin/change-password", isAuthenticated, async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Store new password hash in database
    const newHash = hashPassword(newPassword);
    try {
      await db.execute(sql`
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES ('admin_password_hash', ${newHash}, NOW())
        ON CONFLICT (key)
        DO UPDATE SET value = ${newHash}, updated_at = NOW()
      `);
      return res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ message: "Failed to change password" });
    }
  });
}
