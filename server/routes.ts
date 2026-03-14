import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, registerAuthRoutes } from "./auth";
import { insertStateSchema, insertArticleSchema, insertResourceSchema } from "@shared/schema";
import { ZodError } from "zod";
import { sql } from "drizzle-orm";
import { db } from "./db";

function handleZodError(res: any, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
  }
  throw error;
}

import path from "path";
import fs from "fs";
import crypto from "crypto";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register auth routes (login, logout, user check)
  registerAuthRoutes(app);


  // SEO: robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /

Sitemap: https://onlineboatereducation.com/sitemap.xml`);
  });

  // SEO: sitemap.xml — dynamically generated from database
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const states = await storage.getActiveStates();
      const articles = await storage.getPublishedArticles();
      const today = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://onlineboatereducation.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://onlineboatereducation.com/states</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://onlineboatereducation.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://onlineboatereducation.com/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

      for (const state of states) {
        xml += `
  <url>
    <loc>https://onlineboatereducation.com/states/${state.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }

      for (const article of articles) {
        xml += `
  <url>
    <loc>https://onlineboatereducation.com/blog/${article.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }

      xml += `
</urlset>`;

      res.type("application/xml").send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });


  // Public API routes
  app.get("/api/states", async (_req, res) => {
    try {
      const states = await storage.getActiveStates();
      res.json(states);
    } catch (error) {
      console.error("Error fetching states:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  app.get("/api/states/:slug", async (req, res) => {
    try {
      const state = await storage.getStateBySlug(req.params.slug);
      if (!state) {
        return res.status(404).json({ message: "State not found" });
      }
      res.json(state);
    } catch (error) {
      console.error("Error fetching state:", error);
      res.status(500).json({ message: "Failed to fetch state" });
    }
  });

  app.get("/api/articles", async (_req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/recent", async (_req, res) => {
    try {
      // Return featured articles first; fall back to recent if fewer than 6 featured
      const featured = await storage.getFeaturedArticles(6);
      if (featured.length >= 6) {
        return res.json(featured);
      }
      // Fill remaining slots with recent non-featured articles
      const recent = await storage.getRecentPublishedArticles(6);
      const featuredIds = new Set(featured.map(a => a.id));
      const filler = recent.filter(a => !featuredIds.has(a.id));
      const combined = [...featured, ...filler].slice(0, 6);
      res.json(combined);
    } catch (error) {
      console.error("Error fetching recent articles:", error);
      res.status(500).json({ message: "Failed to fetch recent articles" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  
  // Public resource endpoint for chat
  app.get("/api/states/:id/resources", async (req, res) => {
    const stateId = parseInt(req.params.id);
    if (isNaN(stateId)) return res.status(400).json({ message: "Invalid state ID" });
    const resources = await storage.getActiveResourcesByStateId(stateId);
    res.json(resources);
  });

// Admin routes (protected)
  app.get("/api/admin/states", isAuthenticated, async (_req, res) => {
    try {
      const states = await storage.getStates();
      res.json(states);
    } catch (error) {
      console.error("Error fetching admin states:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  app.post("/api/admin/states", isAuthenticated, async (req, res) => {
    try {
      const validated = insertStateSchema.parse(req.body);
      const state = await storage.createState(validated);
      res.status(201).json(state);
    } catch (error: any) {
      try {
        handleZodError(res, error);
      } catch {
        console.error("Error creating state:", error);
        res.status(400).json({ message: error.message || "Failed to create state" });
      }
    }
  });

  app.patch("/api/admin/states/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertStateSchema.partial().parse(req.body);
      const state = await storage.updateState(id, validated);
      if (!state) {
        return res.status(404).json({ message: "State not found" });
      }
      res.json(state);
    } catch (error: any) {
      try {
        handleZodError(res, error);
      } catch {
        console.error("Error updating state:", error);
        res.status(400).json({ message: error.message || "Failed to update state" });
      }
    }
  });

  app.delete("/api/admin/states/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteState(id);
      res.json({ message: "State deleted" });
    } catch (error) {
      console.error("Error deleting state:", error);
      res.status(500).json({ message: "Failed to delete state" });
    }
  });

  app.get("/api/admin/articles", isAuthenticated, async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching admin articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.post("/api/admin/articles", isAuthenticated, async (req, res) => {
    try {
      const validated = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validated);
      res.status(201).json(article);
    } catch (error: any) {
      try {
        handleZodError(res, error);
      } catch {
        console.error("Error creating article:", error);
        res.status(400).json({ message: error.message || "Failed to create article" });
      }
    }
  });

  app.patch("/api/admin/articles/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(id, validated);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      try {
        handleZodError(res, error);
      } catch {
        console.error("Error updating article:", error);
        res.status(400).json({ message: error.message || "Failed to update article" });
      }
    }
  });

  app.delete("/api/admin/articles/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArticle(id);
      res.json({ message: "Article deleted" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  app.post("/api/admin/articles/reorder", isAuthenticated, async (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "orderedIds must be an array" });
      }
      await storage.reorderArticles(orderedIds);
      res.json({ message: "Articles reordered" });
    } catch (error) {
      console.error("Error reordering articles:", error);
      res.status(500).json({ message: "Failed to reorder articles" });
    }
  });

  // Resource admin CRUD
  app.get("/api/admin/resources", isAuthenticated, async (_req, res) => {
    const resources = await storage.getResources();
    res.json(resources);
  });

  app.post("/api/admin/resources", isAuthenticated, async (req, res) => {
    const parsed = insertResourceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid resource data" });
    const resource = await storage.createResource(parsed.data);
    res.status(201).json(resource);
  });

  app.patch("/api/admin/resources/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const resource = await storage.updateResource(id, req.body);
    res.json(resource);
  });

  app.delete("/api/admin/resources/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteResource(id);
    res.sendStatus(204);
  });


  // Site settings endpoints
  app.get("/api/site-settings", async (_req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT key, value FROM admin_settings WHERE key LIKE 'site_%'`
      );
      const settings: Record<string, string> = {};
      for (const row of result.rows as any[]) {
        settings[row.key] = row.value;
      }
      res.json(settings);
    } catch {
      res.json({});
    }
  });

  app.post("/api/admin/site-settings", isAuthenticated, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || typeof key !== "string" || !key.startsWith("site_")) {
        return res.status(400).json({ message: "Invalid setting key" });
      }
      await db.execute(sql`
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key)
        DO UPDATE SET value = ${value}, updated_at = NOW()
      `);
      res.json({ message: "Setting saved" });
    } catch (error: any) {
      console.error("Error saving site setting:", error);
      res.status(500).json({ message: "Failed to save setting" });
    }
  });

  // Image upload endpoint - accepts base64 JSON body
  const uploadDir = path.join(process.cwd(), "dist", "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadDir));

  app.post("/api/admin/upload", isAuthenticated, express.json({ limit: "10mb" }), async (req, res) => {
    try {
      const { data, filename, mimeType } = req.body;
      if (!data) {
        return res.status(400).json({ message: "No image data provided" });
      }
      const base64Data = data.replace(/^data:[^;]+;base64,/, "");
      const ext = (filename || "image.png").split(".").pop() || "png";
      const uniqueName = crypto.randomBytes(8).toString("hex") + "-" + Date.now() + "." + ext;
      const filePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      res.json({ url: "/uploads/" + uniqueName });
    } catch (err: any) {
      res.status(500).json({ message: "Upload failed: " + err.message });
    }
  });

  return httpServer;
}
