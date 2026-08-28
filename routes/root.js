// const data = { phones: ['+123'], domains: ['test.com'] };
const topCartoons = [
  { id: 1, title: "Головоломка 2 (Inside Out 2)", boxOffice: "$1.70 млрд", year: 2024 },
  { id: 2, title: "Холодное сердце 2 (Frozen II)", boxOffice: "$1.45 млрд", year: 2019 },
  { id: 3, title: "Братья Супер Марио в кино (The Super Mario Bros. Movie)", boxOffice: "$1.36 млрд", year: 2023 },
];
const topMovies = [
  { id: 1, title: 'Аватар (Avatar)', boxOffice: '$2.92 млрд', year: 2009 },
  { id: 2, title: 'Мстители: Финал (Avengers: Endgame)', boxOffice: '$2.79 млрд', year: 2019 },
  { id: 3, title: 'Аватар: Путь воды (Avatar: The Way of Water)', boxOffice: '$2.32 млрд', year: 2022 }
];

const topSeries = [
  { id: 1, title: 'Игра престолов (Game of Thrones)', rating: '9.2', network: 'HBO' },
  { id: 2, title: 'Во все тяжкие (Breaking Bad)', rating: '9.5', network: 'AMC' },
  { id: 3, title: 'Очень странные дела (Stranger Things)', rating: '8.7', network: 'Netflix' }
];

const users = {
  user: [
    {
      id: 1,
      post: [
        {
          id: 1,
          text: "some",
        },
      ],
    },
  ],
};
export default async function (fastify, opts) {
  fastify.get("/hello", async function (request, reply) {
    const name = request.query.name || "World";

    reply.send(`Hello, ${name}!`);
  });
  // users/{id}/post/{postId}
  fastify.get("/users/:id/post/:postId", (req, res) => {
    const { id, postId } = req.params;
    const user = users.user.find((u) => u.id === Number(id));
    if (!user) {
      return res.code(404).send({ message: "User not found" });
    }

    const post = user.post.find((p) => p.id === Number(postId));
    if (!post) {
      return res.code(404).send({ message: "Post not found" });
    }

    res.send(`User ID: ${user.id}; Post Text: ${post.text}`);
  });

  fastify.get('/', async function (request, reply) {
    const data = {
      title: 'Топ кассовых мультфильмов в мире',
      cartoons: topCartoons
    };

    return reply.view('index.eta', data);
  });
 fastify.get('/cartoon/:id', async function (request, reply) {
    const { id } = request.params;
    const cartoon = topCartoons.find((c) => c.id === Number(id));
    if (!cartoon) {
      return reply.status(404).send('Мультфильм не найден');
    }
    return reply.view('show.eta', { cartoon });
  });

    // Маршрут для фильмов
  fastify.get('/movies', async function (request, reply) {
    const data = {
      title: 'Топ крутых фильмов в истории',
      movies: topMovies
    };
    return reply.view('movies.eta', data);
  });
    // Страница конкретного фильма
  fastify.get('/movie/:id', async function (request, reply) {
    const { id } = request.params;
    const movie = topMovies.find((m) => m.id === Number(id));

    if (!movie) {
      return reply.status(404).send('Фильм не найден');
    }

    return reply.view('movie-show.eta', { movie });
  });




  // Маршрут для сериалов
  fastify.get('/series', async function (request, reply) {
    const data = {
      title: 'Легендарные сериалы с высоким рейтингом',
      series: topSeries
    };
    return reply.view('series.eta', data);
  });
  // Страница конкретного сериала
  fastify.get('/serie/:id', async function (request, reply) {
    const { id } = request.params;
    const show = topSeries.find((s) => s.id === Number(id));

    if (!show) {
      return reply.status(404).send('Сериал не найден');
    }

    return reply.view('series-show.eta', { show });
  });
  // fastify.get("/", async function (request, reply) {
  //   reply.send("Welcome to Hexlet!");
  // });
  // fastify.get("/users", (req, res) => {
  //   res.send("GET /users");
  // });

  // fastify.post("/users", (req, res) => {
  //   res.send("POST /users");
  // });
  // fastify.get("/phones", async function (request, reply) {
  //   reply.send(data.phones);
  // });

  // fastify.get("/domains", async function (request, reply) {
  //   reply.send(data.domains);
  // });
}

// Файлы, которые лежат прямо в routes, отвечают по тому адресу, который объявлен в обработчике. У файла внутри поддиректории имя этой поддиректории становится началом адреса, а имя файла в адрес не попадает вовсе.
// routes/root.js            app.get('/')      GET /
// routes/example/index.js   app.get('/')      GET /example
// routes/users/index.js     app.get('/:id')   GET /users/:id
// routes/users.js           app.get('/users') GET /users
