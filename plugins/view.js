import fp from "fastify-plugin";
import view from "@fastify/view";
import { Eta } from "eta";
import path from "path";

export default fp(async (fastify, opts) => {
  const eta = new Eta();

  fastify.register(view, {
    engine: {
      eta: eta,
    },
    // Указываем Fastify, что все наши шаблоны лежат в папке views в корне проекта
    root: path.join(process.cwd(), "views"),
  });
});
