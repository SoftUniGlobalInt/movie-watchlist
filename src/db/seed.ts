import { config } from "dotenv";
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const movieData = [
  { title: "The Shawshank Redemption", slug: "the-shawshank-redemption", description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", year: 1994, director: "Frank Darabont", genre: "Drama", posterUrl: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg" },
  { title: "The Godfather", slug: "the-godfather", description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.", year: 1972, director: "Francis Ford Coppola", genre: "Crime", posterUrl: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg" },
  { title: "The Dark Knight", slug: "the-dark-knight", description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", year: 2008, director: "Christopher Nolan", genre: "Action", posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg" },
  { title: "Schindler's List", slug: "schindlers-list", description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.", year: 1993, director: "Steven Spielberg", genre: "Drama", posterUrl: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg" },
  { title: "Pulp Fiction", slug: "pulp-fiction", description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", year: 1994, director: "Quentin Tarantino", genre: "Crime", posterUrl: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg" },
  { title: "Forrest Gump", slug: "forrest-gump", description: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man with an IQ of 75.", year: 1994, director: "Robert Zemeckis", genre: "Drama", posterUrl: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg" },
  { title: "Inception", slug: "inception", description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", year: 2010, director: "Christopher Nolan", genre: "Sci-Fi", posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg" },
  { title: "The Matrix", slug: "the-matrix", description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.", year: 1999, director: "The Wachowskis", genre: "Sci-Fi", posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
  { title: "Goodfellas", slug: "goodfellas", description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.", year: 1990, director: "Martin Scorsese", genre: "Crime", posterUrl: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg" },
  { title: "Interstellar", slug: "interstellar", description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", year: 2014, director: "Christopher Nolan", genre: "Sci-Fi", posterUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg" },
  { title: "Fight Club", slug: "fight-club", description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.", year: 1999, director: "David Fincher", genre: "Drama", posterUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
  { title: "The Silence of the Lambs", slug: "the-silence-of-the-lambs", description: "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.", year: 1991, director: "Jonathan Demme", genre: "Thriller", posterUrl: "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg" },
  { title: "Se7en", slug: "se7en", description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.", year: 1995, director: "David Fincher", genre: "Thriller", posterUrl: "https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg" },
  { title: "The Lord of the Rings: The Fellowship of the Ring", slug: "lotr-fellowship-of-the-ring", description: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.", year: 2001, director: "Peter Jackson", genre: "Fantasy", posterUrl: "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg" },
  { title: "Parasite", slug: "parasite", description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", year: 2019, director: "Bong Joon-ho", genre: "Thriller", posterUrl: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg" },
];

const userData = [
  { email: "alice@example.com", name: "Alice Johnson", password: "password123", role: "admin" as const },
  { email: "bob@example.com", name: "Bob Smith", password: "password456", role: "user" as const },
];

const watchlistData = [
  // Alice's watchlist (user index 0) — 7 movies
  { userIndex: 0, movieIndex: 0, status: "watched" as const, rating: 10, review: "One of the greatest films ever made. Truly inspiring." },
  { userIndex: 0, movieIndex: 1, status: "watched" as const, rating: 9, review: "A masterpiece of cinema. Brando is incredible." },
  { userIndex: 0, movieIndex: 2, status: "watched" as const, rating: 10, review: "Heath Ledger's Joker is unforgettable." },
  { userIndex: 0, movieIndex: 6, status: "watching" as const, rating: null, review: null },
  { userIndex: 0, movieIndex: 7, status: "watched" as const, rating: 9, review: "Changed the way I think about reality." },
  { userIndex: 0, movieIndex: 9, status: "to_watch" as const, rating: null, review: null },
  { userIndex: 0, movieIndex: 13, status: "to_watch" as const, rating: null, review: null },

  // Bob's watchlist (user index 1) — 8 movies
  { userIndex: 1, movieIndex: 4, status: "watched" as const, rating: 9, review: "Tarantino at his best. Non-linear storytelling done right." },
  { userIndex: 1, movieIndex: 5, status: "watched" as const, rating: 8, review: "A heartwarming journey through American history." },
  { userIndex: 1, movieIndex: 8, status: "watched" as const, rating: 9, review: "Best mob movie alongside The Godfather." },
  { userIndex: 1, movieIndex: 10, status: "watching" as const, rating: null, review: null },
  { userIndex: 1, movieIndex: 11, status: "watched" as const, rating: 8, review: "Deeply unsettling but brilliantly crafted." },
  { userIndex: 1, movieIndex: 12, status: "to_watch" as const, rating: null, review: null },
  { userIndex: 1, movieIndex: 14, status: "watched" as const, rating: 10, review: "Bong Joon-ho deserved every Oscar." },
  { userIndex: 1, movieIndex: 3, status: "to_watch" as const, rating: null, review: null },
];

async function seed() {
  console.log("Seeding database...");

  // Clear existing data in order (FK constraints)
  await db.delete(schema.userMovies);
  await db.delete(schema.users);
  await db.delete(schema.movies);

  // Insert movies
  const insertedMovies = await db.insert(schema.movies).values(movieData).returning();
  console.log(`Inserted ${insertedMovies.length} movies.`);

  // Insert users with hashed passwords
  const hashedUsers = await Promise.all(
    userData.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    }))
  );
  const insertedUsers = await db.insert(schema.users).values(hashedUsers).returning();
  console.log(`Inserted ${insertedUsers.length} users.`);

  // Insert watchlist entries
  const watchlistValues = watchlistData.map((entry) => ({
    userId: insertedUsers[entry.userIndex].id,
    movieId: insertedMovies[entry.movieIndex].id,
    status: entry.status,
    rating: entry.rating ?? null,
    review: entry.review ?? null,
  }));
  const insertedWatchlist = await db.insert(schema.userMovies).values(watchlistValues).returning();
  console.log(`Inserted ${insertedWatchlist.length} watchlist entries.`);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
