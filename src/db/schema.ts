import { pgTable, serial, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["to_watch", "watching", "watched"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  year: integer("year").notNull(),
  director: varchar("director", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 100 }).notNull(),
  posterUrl: varchar("poster_url", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userMovies = pgTable("user_movies", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: statusEnum("status").notNull().default("to_watch"),
  rating: integer("rating"),
  review: text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
