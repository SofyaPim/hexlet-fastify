// routes/session.js
export default async function (fastify, _opts) {

  // Страница с формой
  fastify.get("/session/new", { name: "newSession" }, async (request, reply) => {
    return reply.view("session/new.eta");
  });

  // Процесс логина
  fastify.post("/session", { name: "createSession" }, async (request, reply) => {
    const { username } = request.body;
    request.session.username = username; 
   request.flash('success', 'Вы успешно вошли в систему');
    return reply.redirect(fastify.reverse("root")); 
  });


  fastify.post("/session/delete", { name: "deleteSession" }, async (request, reply) => {
     request.flash('info', 'Вы вышли из системы');
    request.session.destroy((err) => {
      if (err) fastify.log.error(err);
    });
    return reply.redirect(fastify.reverse("root"));
  });

}
