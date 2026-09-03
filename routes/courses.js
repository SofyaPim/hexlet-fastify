import yup from "yup";
import Database from "better-sqlite3";

// Создаем базу данных прямо в оперативной памяти (абсолютно синхронно)
const db = new Database(":memory:");

// Создаем таблицу для курсов Хогвартса
db.prepare(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT
  );
`).run();

// Наполняем базу стартовыми данными Хогвартса, если она пуста
const checkEmpty = db.prepare("SELECT COUNT(*) as count FROM courses").get();
if (checkEmpty.count === 0) {
  const insertCourse = db.prepare("INSERT INTO courses (title, description) VALUES (?, ?)");
  insertCourse.run("Защита от тёмных искусств", "Изучение заклинаний Экспеллиармус, Ридикулус и вызов Патронуса.");
  insertCourse.run("Зельеварение", "Приготовление сложных составов: от жидкой удачи Феликс Фелицис до Оборотного зелья.");
  insertCourse.run("Трансфигурация", "Искусство превращения спичек в иголки, а крыс — в кубки для вина.");
  insertCourse.run("Прорицание", "Гадание на кофейной гуще, чтение хрустальных шаров и предсказание мрака.");
}

// Наш репозиторий, который теперь возвращает данные мгновенно
const coursesRepository = {
  get: () => {
    return db.prepare("SELECT * FROM courses").all();
  },

  find: (id) => {
    return db.prepare("SELECT * FROM courses WHERE id = ?").get(id);
  },

  save: (course) => {
    const result = db
      .prepare("INSERT INTO courses (title, description) VALUES (?, ?)")
      .run(course.title, course.description);
    
    course.id = result.lastInsertRowid;
    return course;
  },

   update: (id, data) => {
    db.prepare("UPDATE courses SET title = ?, description = ? WHERE id = ?")
      .run(data.title, data.description, id);
  },
  
  destroy: (id) => {
    db.prepare("DELETE FROM courses WHERE id = ?").run(id);
  }
};


// let hogwartsCourses = [
//   { id: 1, title: "Защита от тёмных искусств", description: "Изучение заклинаний Экспеллиармус, Ридикулус и вызов Патронуса." },
//   { id: 2, title: "Зельеварение", description: "Приготовление сложных составов: от жидкой удачи Феликс Фелицис до Оборотного зелья." },
//   { id: 3, title: "Трансфигурация", description: "Искусство превращения спичек в иголки, а крыс — в кубки для вина." },
//   { id: 4, title: "Прорицание", description: "Гадание на кофейной гуще, чтение хрустальных шаров и предсказание мрака." },
// ];

// let nextCourseId = 5;
// const coursesRepository = {
//   get: () => hogwartsCourses,
//   find: (id) => hogwartsCourses.find((course) => String(course.id) === String(id)),
//   save: (course) => {
//     course.id = nextCourseId++;
//     hogwartsCourses.push(course);
//     return course;
//   },
// };
export default async function (fastify, opts) {
 
  fastify.get("/courses", { name: "courses" }, async function (request, reply) {
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
         reverse: fastify.reverse.bind(fastify), 
    };
  
       return reply.view("courses/courses.eta", data);
  });

 fastify.post(
    "/courses",
    {
      name:"createCourse",
      attachValidation: true,
      schema: {
        body: yup.object({        
          title: yup.string().min(2, "Название курса должно быть не меньше двух символов"),
          description: yup.string().min(10, "Описание должно содержать не менее 10 символов"),
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
      const { title, description } = request.body;
      if (request.validationError) {
        const data = {
          title,
          description,
          error: request.validationError,
             reverse: fastify.reverse.bind(fastify), 
        };
        return reply.view("courses/new_course.eta", data);
      }
      const course = {
        title: title.trim(),
        description: description.trim(),
      };
      coursesRepository.save(course);

       // ВМЕСТО: reply.redirect("/courses")
      // ИСПОЛЬЗУЕМ: генерацию пути по имени маршрута.
      return reply.redirect(fastify.reverse("courses"));
    },
  );

  fastify.get("/courses/new_course",{ name: "newCourse" }, async function (request, reply) {
    // return reply.view("courses/new_course.eta");
  return reply.view("courses/new_course.eta", { reverse: fastify.reverse.bind(fastify) });
  });
     // 1. Форма редактирования курса (например, /courses/1/edit)
  fastify.get("/courses/:id/edit", { name: "editCourse" }, async (req, res) => {
    const course = coursesRepository.find(req.params.id);
    if (!course) {
      return res.code(404).send("Курс не найден");
    }
    return res.view("courses/edit-course.eta", { course, reverse: fastify.reverse.bind(fastify) });
  });

  // 2. Обработчик обновления данных курса
  fastify.post("/courses/:id/update", { name: "updateCourse" }, async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    // Простая валидация
    if (!title || title.trim().length < 2) {
      return res.code(400).send("Некорректное название курса");
    }

    coursesRepository.update(id, { title: title.trim(), description: description.trim() });
    return res.redirect(fastify.reverse("courses"));
  });

  // 3. Обработчик удаления курса
  fastify.post("/courses/:id/delete", { name: "deleteCourse" }, async (req, res) => {
    coursesRepository.destroy(req.params.id);
    return res.redirect(fastify.reverse("courses"));
  });

}