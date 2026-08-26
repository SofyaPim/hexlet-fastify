// const data = { phones: ['+123'], domains: ['test.com'] };
const users = {
  user: [
    {
      id: 1,
      post: [
        {
          id:1,
        text: 'some'
        }
        
      ]
    },
  ],
};
export default async function (fastify, opts) {
  fastify.get('/hello', async function (request, reply) {  
  const name = request.query.name || 'World'

  reply.send(`Hello, ${name}!`)
})
// users/{id}/post/{postId}
  fastify.get("/users/:id/post/:postId", (req, res) => {
    const { id, postId}  = req.params;
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
