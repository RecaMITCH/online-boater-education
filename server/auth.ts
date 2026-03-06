import type { Request, Response, NextFunction } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export function registerAuthRoutes(app: any) {
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (password === adminPassword) {
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
}
