import { eq, desc, asc, and, or, isNull, sql } from "drizzle-orm";
import { db } from "./db";
import {
  states,
  articles,
  type State,
  type InsertState,
  type Article,
  type InsertArticle,
  resources,
  type Resource,
  type InsertResource,
} from "@shared/schema";

export interface IStorage {
  getStates(): Promise<State[]>;
  getActiveStates(): Promise<State[]>;
  getStateBySlug(slug: string): Promise<State | undefined>;
  getStateById(id: number): Promise<State | undefined>;
  createState(state: InsertState): Promise<State>;
  updateState(id: number, state: Partial<InsertState>): Promise<State | undefined>;
  deleteState(id: number): Promise<void>;

  getArticles(): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  getRecentPublishedArticles(limit: number): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticleById(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<void>;
  getResources(): Promise<Resource[]>;
  getActiveResourcesByStateId(stateId: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource>;
  deleteResource(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getStates(): Promise<State[]> {
    return db.select().from(states).orderBy(states.name);
  }

  async getActiveStates(): Promise<State[]> {
    return db.select().from(states).where(eq(states.isActive, true)).orderBy(states.name);
  }

  async getStateBySlug(slug: string): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.slug, slug));
    return state;
  }

  async getStateById(id: number): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }

  async createState(state: InsertState): Promise<State> {
    const [created] = await db.insert(states).values(state).returning();
    return created;
  }

  async updateState(id: number, state: Partial<InsertState>): Promise<State | undefined> {
    const [updated] = await db.update(states).set(state).where(eq(states.id, id)).returning();
    return updated;
  }

  async deleteState(id: number): Promise<void> {
    await db.delete(states).where(eq(states.id, id));
  }

  async getArticles(): Promise<Article[]> {
    return db.select().from(articles).orderBy(asc(articles.sortOrder), desc(articles.createdAt));
  }

  async getPublishedArticles(): Promise<Article[]> {
    return db
      .select()
      .from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(asc(articles.sortOrder), desc(articles.publishedAt));
  }

  async getRecentPublishedArticles(limit: number): Promise<Article[]> {
    return db
      .select()
      .from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(asc(articles.sortOrder), desc(articles.publishedAt))
      .limit(limit);
  }

  async reorderArticles(orderedIds: number[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(articles).set({ sortOrder: i }).where(eq(articles.id, orderedIds[i]));
    }
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(
      and(eq(articles.slug, slug), eq(articles.isPublished, true))
    );
    return article;
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [created] = await db.insert(articles).values(article).returning();
    return created;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updated] = await db
      .update(articles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async getActiveResourcesByStateId(stateId: number): Promise<Resource[]> {
    return await db.select().from(resources).where(
      and(
        eq(resources.isActive, true),
        or(eq(resources.stateId, stateId), isNull(resources.stateId))
      )
    );
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [created] = await db.insert(resources).values(resource).returning();
    return created;
  }

  async updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource> {
    const [updated] = await db.update(resources).set({ ...resource, updatedAt: new Date() }).where(eq(resources.id, id)).returning();
    return updated;
  }

  async deleteResource(id: number): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }
}

export const storage = new DatabaseStorage();
