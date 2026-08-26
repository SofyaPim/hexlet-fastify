// const data = { phones: ['+123'], domains: ['test.com'] };
export default async function (fastify, opts) {
  fastify.get('/hello', async function (request, reply) {
  // Извлекаем параметр name из query-строки. 
  // Если он не передан (undefined), используем значение по умолчанию 'World'
  const name = request.query.name || 'World'
  
  // Отправляем приветствие обратно пользователю
  reply.send(`Hello, ${name}!`)
})
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
