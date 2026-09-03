import yup from "yup";
import Database from "better-sqlite3";

// Инициализируем базу данных в оперативной памяти
const db = new Database(":memory:");

// Создаем таблицу для пользователей
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  );
`,
).run();

const usersRepository = {
  get: () => {
    return db.prepare("SELECT * FROM users").all();
  },

  find: (id) => {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  },

  // Сохранить нового пользователя в БД
  save: (user) => {
    const result = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(user.username, user.email, user.password);

    user.id = result.lastInsertRowid;
    return user;
  },
};

export default async function (fastify, opts) {
  // Наполняем базу стартовыми пользователями (как в фильмах и курсах)
  const checkEmpty = db.prepare("SELECT COUNT(*) as count FROM users").get();
  if (checkEmpty.count === 0) {
    const insertUser = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    insertUser.run("Sheldon", "sheldon@caltech.edu", "bazinga");
    insertUser.run("Leonard", "leonard@caltech.edu", "password123");
    insertUser.run("Penny", "penny@cheesecake.com", "knock_knock_knock");
    insertUser.run("Howard", "wolowitz@caltech.edu", "space_cowboy");
    insertUser.run("Raj", "raj@caltech.edu", "cinnamon");
  }

  fastify.get("/users", { name: "users" }, async function (request, reply) {
    const users = usersRepository.get();
    return reply.view("users/index.eta", { users, reverse: fastify.reverse.bind(fastify) });
  });

  fastify.get("/users/new", { name: "newUserForm" }, async function (request, reply) {
    return reply.view("users/new.eta", { reverse: fastify.reverse.bind(fastify) });
  });

  fastify.post(
    "/users",
    {
      name: "createUser",
      attachValidation: true,
      schema: {
        body: yup.object({
          username: yup.string().min(2, "Имя должно быть не меньше двух символов"),
          email: yup.string().email("Некорректный формат email"),
          password: yup.string().min(5, "Пароль должен быть не меньше 5 символов"),
          passwordConfirmation: yup
            .string()
            .min(5, "Подтверждение пароля должно быть не меньше 5 символов")
            .oneOf([yup.ref("password")], "Пароли не совпадают"),
        }),
      },
      validatorCompiler: ({ schema }) => {
        return (data) => {
          try {
            const result = schema.validateSync(data, { abortEarly: false });
            return { value: result };
          } catch (e) {
            return { error: e };
          }
        };
      },
    },
    async (request, reply) => {
      const { username, email, password, passwordConfirmation } = request.body;

      if (request.validationError) {
        const data = {
          username,
          email,
          password,
          passwordConfirmation,
          error: request.validationError,
          reverse: fastify.reverse.bind(fastify),
          flash: [{ type: "danger", message: "Ошибка регистрации: проверьте корректность введённых данных" }],
        };

        return reply.view("users/new.eta", data);
      }

      // 2. ЕСЛИ ВСЁ ПРОШЛО УСПЕШНО
      //  const user = {
      //    username: username.trim(),
      //    email: email.trim().toLowerCase(),
      //    password: password,
      //  };

      //  usersRepository.save(user);

      //  request.flash("success", "Вы успешно зарегистрировались в системе!");

      //  return reply.redirect(fastify.reverse('users'));
      // Проверяем, нет ли уже пользователя с таким email в базе данных SQLite
      const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

      if (existingUser) {
        // Если нашли — записываем предупреждение и возвращаем на форму
        request.flash("warning", "Пользователь с таким Email уже зарегистрирован!");
        return reply.redirect(fastify.reverse("newUserForm"));
      }

      // Если email свободен — сохраняем как обычно
      const user = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };
      usersRepository.save(user);
      request.flash("success", "Пользователь успешно зарегистрирован!");
      return reply.redirect(fastify.reverse("users"));
    },
  );

  fastify.get("/users/:id", { name: "userShow" }, async function (request, reply) {
    const user = usersRepository.find(request.params.id);
    if (!user) return reply.status(404).send("User not found");
    return reply.view("users/show.eta", { user });
  });
}
