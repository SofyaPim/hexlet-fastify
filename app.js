import path from "node:path";
import AutoLoad from "@fastify/autoload";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pass --options via CLI arguments in command to enable these options.
export const options = {};

export default async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

   fastify.addHook("preHandler", async (request, reply) => {
      // 1. ЗАЩИТА: Если сессия была удалена (например, при логауте), 
    // или её ещё нет, сразу выходим и ничего не делаем
    if (!request.session) {
      reply.locals = {
        ...reply.locals,
        route: (name, params) => fastify.reverse(name, params),
        username: null,
        flash: [],
      };
      return;
    }

    // 2. Читаем флеш-сообщения ТОЛЬКО при GET-запросах (отображение страниц)
    // Это не даст сообщениям зависнуть или удалиться в момент POST-отправки формы
    let flashMessages = [];
    if (request.method === "GET") {
      const rawFlash = reply.flash() || {};
      flashMessages = Object.entries(rawFlash).flatMap(([type, messages]) => 
        messages.map(message => ({ type, message }))
      );
    }

    // 3. Безопасно наполняем контекст locals
    reply.locals = {
      ...reply.locals,
      route: (name, params) => fastify.reverse(name, params),
      username: request.session.username || null, // Читаем только если сессия жива
      flash: flashMessages,
    };
  });
  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
}
