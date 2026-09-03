import Database from "better-sqlite3";

// Создаем базу данных в оперативной памяти
const db = new Database(":memory:");

// Создаем таблицу
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    boxOffice VARCHAR(50),
    year INTEGER
  );
`,
).run();

// Наполняем базу, если она пуста
const checkEmpty = db.prepare("SELECT COUNT(*) as count FROM movies").get();
if (checkEmpty.count === 0) {
  const insertMovie = db.prepare("INSERT INTO movies (title, boxOffice, year) VALUES (?, ?, ?)");
  insertMovie.run("Аватар (Avatar)", "$2.92 млрд", 2009);
  insertMovie.run("Мстители: Финал (Avengers: Endgame)", "$2.79 млрд", 2019);
  insertMovie.run("Аватар: Путь воды (Avatar: The Way of Water)", "$2.32 млрд", 2022);
}
const moviesRepository = {
  // Получить все фильмы
  get: () => {
    return db.prepare("SELECT * FROM movies").all();
  },

  // Найти конкретный фильм по ID
  find: (id) => {
    return db.prepare("SELECT * FROM movies WHERE id = ?").get(id);
  },

  save: (movie) => {
    const result = db.prepare("INSERT INTO movies (title, boxOffice, year) VALUES (?, ?, ?)").run(movie.title, movie.boxOffice, Number(movie.year));

    movie.id = result.lastInsertRowid;
    return movie;
  },
};

export default async function (fastify, opts) {
  fastify.get("/movies", { name: "movies" }, async function (request, reply) {
    const data = {
      title: "Топ крутых фильмов в истории",
      movies: moviesRepository.get(),
      reverse: fastify.reverse.bind(fastify),
    };
    return reply.view("movies/movies.eta", data);
  });

  fastify.get("/movie/:id", { name: "movieShow" }, async function (request, reply) {
    const { id } = request.params;
    const movie = moviesRepository.find(id);

    if (!movie) {
      return reply.status(404).send("Фильм не найден");
    }

    return reply.view("movies/movie-show.eta", {
      movie,
      reverse: fastify.reverse.bind(fastify),
    });
  });
  fastify.get("/movies/new", { name: "newMovie" }, async function (request, reply) {
    return reply.view("movies/movies-new.eta", {
      reverse: fastify.reverse.bind(fastify),
    });
  });
  fastify.post("/movies", { name: "createMovie" }, async function (request, reply) {
    const { title, boxOffice, year } = request.body;

    // Простая валидация: заголовок и год обязательны
    if (!title || !year) {
      return reply.status(400).send("Название фильма и год обязательны!");
    }

    const movie = {
      title: title.trim(),
      boxOffice: boxOffice ? boxOffice.trim() : "$0",
      year: year,
    };

    moviesRepository.save(movie);

    // Редирект обратно на список всех фильмов
    return reply.redirect(fastify.reverse("movies"));
  });
}
