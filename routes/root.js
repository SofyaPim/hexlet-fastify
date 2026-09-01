const state = {
  users: [],
};

// const data = { phones: ['+123'], domains: ['test.com'] };
const topCartoons = [
  { id: 1, title: "Головоломка 2 (Inside Out 2)", boxOffice: "$1.70 млрд", year: 2024 },
  { id: 2, title: "Холодное сердце 2 (Frozen II)", boxOffice: "$1.45 млрд", year: 2019 },
  { id: 3, title: "Братья Супер Марио в кино (The Super Mario Bros. Movie)", boxOffice: "$1.36 млрд", year: 2023 },
];
const topMovies = [
  { id: 1, title: "Аватар (Avatar)", boxOffice: "$2.92 млрд", year: 2009 },
  { id: 2, title: "Мстители: Финал (Avengers: Endgame)", boxOffice: "$2.79 млрд", year: 2019 },
  { id: 3, title: "Аватар: Путь воды (Avatar: The Way of Water)", boxOffice: "$2.32 млрд", year: 2022 },
];

const topSeries = [
  { id: 1, title: "Игра престолов (Game of Thrones)", rating: "9.2", network: "HBO" },
  { id: 2, title: "Во все тяжкие (Breaking Bad)", rating: "9.5", network: "AMC" },
  { id: 3, title: "Очень странные дела (Stranger Things)", rating: "8.7", network: "Netflix" },
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

let hogwartsCourses = [
  { id: 1, title: "Защита от тёмных искусств", description: "Изучение заклинаний Экспеллиармус, Ридикулус и вызов Патронуса." },
  { id: 2, title: "Зельеварение", description: "Приготовление сложных составов: от жидкой удачи Феликс Фелицис до Оборотного зелья." },
  { id: 3, title: "Трансфигурация", description: "Искусство превращения спичек в иголки, а крыс — в кубки для вина." },
  { id: 4, title: "Прорицание", description: "Гадание на кофейной гуще, чтение хрустальных шаров и предсказание мрака." },
];

let nextCourseId = 5;
const coursesRepository = {
  get: () => hogwartsCourses,
  find: (id) => hogwartsCourses.find((course) => String(course.id) === String(id)),
  save: (course) => {
    course.id = nextCourseId++;
    hogwartsCourses.push(course);
    return course;
  },
};
// Имитируем базу данных в памяти сервера
let usersCollection = [];
let nextId = 1;

const usersRepository = {
  get: () => usersCollection,
  find: (id) => usersCollection.find((user) => String(user.id) === String(id)),
  save: (user) => {
    user.id = nextId++;
    usersCollection.push(user);
    return user;
  },
};
export default async function (fastify, opts) {

  fastify.post('/users', async function (request, reply) {
    const user = {
      username: request.body.username.trim(),
      email: request.body.email.trim().toLowerCase(),
    };
    
    usersRepository.save(user);
    return reply.redirect('/users');
  });
  // Маршрут для отображения страницы с формой создания пользователя
  fastify.get("/users/new", async function (request, reply) {
    return reply.view("users/new.eta");
  });

    // Маршрут для отображения списка всех пользователей
  fastify.get('/users', async function (request, reply) {
    // Вытаскиваем всех созданных пользователей из нашего репозитория
    const users = usersRepository.get();
    
    // Рендерим файл index.eta и передаем туда этот массив
    return reply.view('users/index.eta', { users });
  });

  fastify.get("/users/:id", async function (request, reply) {
    const user = usersRepository.find(request.params.id);

    if (!user) {
      return reply.status(404).send("User not found");
    }
    return reply.view("users/show.eta", { user });
  });

 
  fastify.get("/courses", async function (request, reply) {
    const term = (request.query.term || "").trim();
    let filteredCourses = coursesRepository.get();

    if (term) {
      const lowerTerm = term.toLowerCase();

      filteredCourses = filteredCourses.filter((course) => {
        const matchTitle = course.title.toLowerCase().includes(lowerTerm);
        const matchDescription = course.description.toLowerCase().includes(lowerTerm);
        return matchTitle || matchDescription;
      });
    }
    const data = {
      courses: filteredCourses,
      term: term,
    };

    return reply.view("courses/courses.eta", data);
  });
    fastify.post('/courses', async function (request, reply) {
    const course = {
      title: request.body.title.trim(),
      description: request.body.description.trim(),
    };
    
    coursesRepository.save(course);
    return reply.redirect('/courses');
  });
  // Маршрут для отображения страницы с формой создания пользователя
  fastify.get("/courses/new_course", async function (request, reply) {
    return reply.view("courses/new_course.eta");
  });
// ==================================================
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

  fastify.get("/", async function (request, reply) {
    const data = {
      title: "Топ кассовых мультфильмов в мире",
      cartoons: topCartoons,
    };

    return reply.view("index.eta", data);
  });
  fastify.get("/cartoon/:id", async function (request, reply) {
    const { id } = request.params;
    const cartoon = topCartoons.find((c) => c.id === Number(id));
    if (!cartoon) {
      return reply.status(404).send("Мультфильм не найден");
    }
    return reply.view("show.eta", { cartoon });
  });

  // Маршрут для фильмов
  fastify.get("/movies", async function (request, reply) {
    const data = {
      title: "Топ крутых фильмов в истории",
      movies: topMovies,
    };
    return reply.view("movies.eta", data);
  });
  // Страница конкретного фильма
  fastify.get("/movie/:id", async function (request, reply) {
    const { id } = request.params;
    const movie = topMovies.find((m) => m.id === Number(id));

    if (!movie) {
      return reply.status(404).send("Фильм не найден");
    }

    return reply.view("movie-show.eta", { movie });
  });

  // Маршрут для сериалов
  fastify.get("/series", async function (request, reply) {
    const data = {
      title: "Легендарные сериалы с высоким рейтингом",
      series: topSeries,
    };
    return reply.view("series.eta", data);
  });
  // Страница конкретного сериала
  fastify.get("/serie/:id", async function (request, reply) {
    const { id } = request.params;
    const show = topSeries.find((s) => s.id === Number(id));

    if (!show) {
      return reply.status(404).send("Сериал не найден");
    }

    return reply.view("series-show.eta", { show });
  });
  // уязвимости
  fastify.get("/xss-test", async function (request, reply) {
    const { id } = request.query;

    if (!id) {
      reply.type("text/html; charset=utf-8");
      return reply.send("Передайте ?id=");
    }

    const escapedId = id.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    reply.type("text/html;charset=utf-8");
    return reply.send(`Идентификатор пользователя: ${escapedId}`);
  });

  // 1. Хук проверки источника запроса (preHandler) из урока
  fastify.addHook("preHandler", async (request, reply) => {
    if (request.method === "POST") {
      const secFetchSite = request.headers["sec-fetch-site"];

      // Если запрос пришел со стороннего сайта (cross-site), отдаем 403 Forbidden
      if (secFetchSite === "cross-site") {
        return reply.status(403).send("Forbidden");
      }
    }
  });

  // 2. Обработчик POST-запроса, который меняет данные
  fastify.post("/change-data", async function (request, reply) {
    return reply.send("Данные изменены успешно!");
  });


}

