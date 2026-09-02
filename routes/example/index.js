// export default async function (fastify, opts) {
//   fastify.get('/', async function (request, reply) {
//     return 'this is an example'
//   })
// }
import view from "@fastify/view";
import { Eta } from "eta";

const state = {
  users: [
    {
      id: 1,
      name: "First User",
      email: "first@user.com",
    },
    {
      id: 2,
      name: "Second User",
      email: "second@user.com",
    },
  ],
};

export default async (app, options) => {
  const eta = new Eta();

  await app.register(view, { engine: { eta } });

  // Просмотр списка пользователей
  app.get("/users", (req, res) => {
    const data = {
      users: state.users,
    };

    res.view("src/views/users/index", data);
  });

  // Форма создания нового пользователя
  app.get("/users/new", (req, res) => res.view("src/views/users/new"));

  // Просмотр конкретного пользователя
  app.get("/users/:id", (req, res) => {
    const { id } = req.params;
    const user = state.users.find((item) => item.id === parseInt(id));
    if (!user) {
      res.code(404).send({ message: "User not found" });
    } else {
      res.view("src/views/users/show", { user });
    }
  });

  // Создание пользователя
  app.post("/users", (req, res) => {
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };

    state.users.push(user);

    res.redirect("/users");
  });

  // Форма редактирования пользователя
  app.get("/users/:id/edit", (req, res) => {
    const { id } = req.params;
    const user = state.users.find((item) => item.id === parseInt(id));
    if (!user) {
      res.code(404).send({ message: "User not found" });
    } else {
      res.view("src/views/users/edit", { user });
    }
  });

  // Обновление пользователя
  app.patch("/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const userIndex = state.users.findIndex((item) => item.id === parseInt(id));
    if (userIndex === -1) {
      res.code(404).send({ message: "User not found" });
    } else {
      state.users[userIndex] = { ...state.users[userIndex], name, email };
      res.redirect("/users");
    }
  });

  // Удаление пользователя
  app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    const userIndex = state.users.findIndex((item) => item.id === parseInt(id));
    if (userIndex === -1) {
      res.code(404).send({ message: "User not found" });
    } else {
      state.users.splice(userIndex, 1);
      res.redirect("/users");
    }
  });
};