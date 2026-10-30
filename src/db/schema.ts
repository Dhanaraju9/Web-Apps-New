import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const loginCarouselConfigs = pgTable('login_carousel_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  scopeType: text('scope_type').notNull(),
  appIds: jsonb('app_ids').notNull().default([]),
  transitionStyle: text('transition_style').notNull(),
  transitionDuration: integer('transition_duration').notNull().default(600),
  autoplayEnabled: boolean('autoplay_enabled').notNull().default(true),
  autoplayInterval: integer('autoplay_interval').notNull().default(4500),
  transitionDirection: text('transition_direction').notNull().default('left'),
  infiniteLoop: boolean('infinite_loop').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  questionText: text('question_text').notNull(),
  questionTextTe: text('question_text_te'),
  options: jsonb('options').notNull(),
  optionsTe: jsonb('options_te'),
  correctAnswer: integer('correct_answer').notNull(),
  explanation: text('explanation'),
  explanationTe: text('explanation_te'),
  subject: text('subject').notNull(),
  difficulty: text('difficulty').default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const currentAffairs = pgTable('current_affairs', {
  id: serial('id').primaryKey(),
  month: text('month').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publishedDate: text('published_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const testAttempts = pgTable('test_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  subject: text('subject').notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  answers: jsonb('answers').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  testAttempts: many(testAttempts),
}));

export const testAttemptsRelations = relations(testAttempts, ({ one }) => ({
  user: one(users, {
    fields: [testAttempts.userId],
    references: [users.id],
  }),
}));
