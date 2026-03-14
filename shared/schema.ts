import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  abbreviation: varchar("abbreviation", { length: 2 }).notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  heroImageUrl: text("hero_image_url"),
  agencyName: text("agency_name").notNull(),
  agencyAbbreviation: text("agency_abbreviation"),
  minimumAge: integer("minimum_age"),
  minimumAgeOnlineOnly: integer("minimum_age_online_only"),
  fieldDayRequired: boolean("field_day_required").notNull().default(true),
  fieldDayDetails: text("field_day_details"),
  courseUrl: text("course_url"),
  coursePrice: text("course_price"),
  additionalRequirements: text("additional_requirements"),
  importantNotes: text("important_notes"),
  extendedContent: text("extended_content"),
  isActive: boolean("is_active").notNull().default(true),
});


export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  stateId: integer("state_id"),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  resourceType: text("resource_type").notNull().default("official_state_page"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStateSchema = createInsertSchema(states).omit({ id: true });
export type InsertState = z.infer<typeof insertStateSchema>;
export type State = typeof states.$inferSelect;

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  coverImageUrl: text("cover_image_url"),
  authorId: varchar("author_id"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  publishedAt: z.union([z.string(), z.date(), z.null()]).optional().transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }),
});
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export const insertResourceSchema = createInsertSchema(resources);
export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
