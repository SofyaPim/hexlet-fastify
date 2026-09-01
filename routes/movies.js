const topMovies = [
  { id: 1, title: "Аватар (Avatar)", boxOffice: "$2.92 млрд", year: 2009 },
  { id: 2, title: "Мстители: Финал (Avengers: Endgame)", boxOffice: "$2.79 млрд", year: 2019 },
  { id: 3, title: "Аватар: Путь воды (Avatar: The Way of Water)", boxOffice: "$2.32 млрд", year: 2022 },
];

export default async function (fastify, opts) {
  
  fastify.get("/movies", { name: "movies" }, async function (request, reply) {
    const data = {
      title: "Топ крутых фильмов в истории",
      movies: topMovies,
      reverse: fastify.reverse.bind(fastify), 
    };
    return reply.view("movies.eta", data);
  });

 
  fastify.get("/movie/:id", { name: "movieShow" }, async function (request, reply) {
    const { id } = request.params;
    const movie = topMovies.find((m) => m.id === Number(id));

    if (!movie) {
      return reply.status(404).send("Фильм не найден");
    }


    return reply.view("movie-show.eta", { 
      movie, 
      reverse: fastify.reverse.bind(fastify) 
    });
  });
}