import { db } from "./db";
import { sql } from "drizzle-orm";

export async function runMigrations() {
  console.log("Running database migrations...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      abbreviation VARCHAR(2) NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      meta_title TEXT,
      meta_description TEXT,
      hero_image_url TEXT,
      agency_name TEXT NOT NULL,
      agency_abbreviation TEXT,
      minimum_age INTEGER,
      minimum_age_online_only INTEGER,
      field_day_required BOOLEAN NOT NULL DEFAULT true,
      field_day_details TEXT,
      course_url TEXT,
      course_price TEXT,
      additional_requirements TEXT,
      important_notes TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      meta_title TEXT,
      meta_description TEXT,
      cover_image_url TEXT,
      author_id VARCHAR,
      is_published BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      state_id INTEGER,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      resource_type TEXT NOT NULL DEFAULT 'official_state_page',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  console.log("Database migrations complete.");
}
