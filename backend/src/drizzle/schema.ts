import { relations } from "drizzle-orm";
import {
  pgTable,
  json,
  uuid,
  text,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Use PostgreSQL's UUID generator
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const objects = pgTable("file_store", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  s3_path: text("s3_path").notNull(),
  file_tree: json("file_tree").default("{}"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 1(user) to many(objects)
export const userRelations = relations(users, ({ many }) => ({
  objectStores: many(objects),
}));

// 1(object) to 1(user)
export const objectStoreRelations = relations(objects, ({ one }) => ({
  user: one(users, {
    fields: [objects.user_id],
    references: [users.id],
  }),
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
