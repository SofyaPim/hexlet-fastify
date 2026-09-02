

export default async function (fastify, _opts) {

   // 1. Форма входа
  fastify.get("/session/new", { name: "newSession" }, async (request, reply) => {
    return reply.view("session/new.eta");
  });

  // 2. Процесс логина (Аутентификация)
  fastify.post("/session", { name: "createSession" }, async (request, reply) => {
    const { username } = request.body;
    
     const registeredUsers = fastify.usersRepository.get();
    // Ищем пользователя по имени (игнорируя регистр букв и пробелы)
    const userExists = registeredUsers.find(
      (user) => user.username.trim().toLowerCase() === username.trim().toLowerCase()
    );

    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ С ТАКИМ ИМЕНЕМ НАЙДЕН
    if (userExists) {
      request.session.username = userExists.username; // Записываем в сессию имя из базы
      request.flash("success", `Добро пожаловать назад, ${userExists.username}!`);
      return reply.redirect(fastify.reverse("root"));
    }

    // ЕСЛИ ПОЛЬЗОВАТЕЛЯ НЕТ В СПИСКЕ ЗАРЕГИСТРИРОВАННЫХ
    const data = {
      username,
      // Напрямую передаем красную флеш-ошибку в шаблон формы входа
      flash: [{ type: 'danger', message: 'Ошибка входа: пользователь с таким именем не зарегистрирован' }]
    };

    return reply.view("session/new.eta", data);
  });

  // 3. Выход из системы
  fastify.post("/session/delete", { name: "deleteSession" }, async (request, reply) => {
    request.session.username = null; 
    request.flash('info', 'Вы вышли из системы');
    return reply.redirect(fastify.reverse("root"));
  });
}
