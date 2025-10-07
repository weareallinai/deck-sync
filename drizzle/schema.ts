import { pgTable, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Decks table
export const decks = pgTable('decks', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  slides: jsonb('slides').notNull().$type<{ id: string; hidden?: boolean }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Slides table
export const slides = pgTable('slides', {
  id: text('id').primaryKey(),
  deckId: text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  bg: jsonb('bg').notNull(),
  elements: jsonb('elements').notNull().$type<unknown[]>(),
  transition: jsonb('transition'),
  advance: jsonb('advance'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  deckId: text('deck_id').notNull().references(() => decks.id),
  status: text('status').notNull().$type<'idle' | 'running' | 'paused' | 'ended'>(),
  deckVersionHash: text('deck_version_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

// Assets table
export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  deckId: text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  type: text('type').notNull().$type<'image' | 'video'>(),
  url: text('url').notNull(),
  size: integer('size'),
  mimeType: text('mime_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

