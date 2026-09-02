import yup from "yup";


const state = {
  users: [],
};

// const data = { phones: ['+123'], domains: ['test.com'] };
const topCartoons = [
  { id: 1, title: "Головоломка 2 (Inside Out 2)", boxOffice: "$1.70 млрд", year: 2024 },
  { id: 2, title: "Холодное сердце 2 (Frozen II)", boxOffice: "$1.45 млрд", year: 2019 },
  { id: 3, title: "Братья Супер Марио в кино (The Super Mario Bros. Movie)", boxOffice: "$1.36 млрд", year: 2023 },
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



export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    // 1. Получаем куку visited
    const visited = request.cookies.visited;

    // 2. Объединяем ваши данные мультфильмов и флаг visited в один объект data
    const data = {
      title: "Топ кассовых мультфильмов в мире",
      cartoons: topCartoons,
      visited: visited, // Передаем состояние куки в шаблон
    };

    // 3. Устанавливаем куку на будущее, чтобы при следующем запросе она считалась
    reply.setCookie('visited', 'true', { path: '/' });

    // 4. Рендерим шаблон
    return reply.view("index.eta", data);
  });
//   fastify.get('/set', async (request, reply) => {
//   reply.setCookie('myCookie', 'hello-world', { path: '/' }); //
//   return { status: 'Cookie set' };
// });
// fastify.get('/get', async (request, reply) => {
//   const cookieValue = request.cookies.myCookie; //
//   return { value: cookieValue || 'Кука не найдена' };
// });


  fastify.get("/hello", async function (request, reply) {
    const name = request.query.name || "World";

    reply.send(`Hello, ${name}!`);
  });
  // users/{id}/post/{postId}
  fastify.get("/users/:id/post/:postId", { name: "userPost" }, (req, res) => {
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

 
  fastify.get("/cartoon/:id", async function (request, reply) {
    const { id } = request.params;
    const cartoon = topCartoons.find((c) => c.id === Number(id));
    if (!cartoon) {
      return reply.status(404).send("Мультфильм не найден");
    }
    return reply.view("show.eta", { cartoon });
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
  // 1. Хук проверки источника запроса (preHandler)
  fastify.addHook("preHandler", async (request, reply) => {
    if (request.method === "POST") {
      const secFetchSite = request.headers["sec-fetch-site"];

      // Если запрос пришел со стороннего сайта (cross-site), отдаем 403 Forbidden
      if (secFetchSite === "cross-site") {
        return reply.status(403).send("Forbidden");
      }
    }
  });
  // // 2. Обработчик POST-запроса, который меняет данные
  // fastify.post("/change-data", async function (request, reply) {
  //   return reply.send("Данные изменены успешно!");
  // });
  
}
