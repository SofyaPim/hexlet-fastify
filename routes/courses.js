import yup from "yup";


let hogwartsCourses = [
  { id: 1, title: "Защита от тёмных искусств", description: "Изучение заклинаний Экспеллиармус, Ридикулус и вызов Патронуса." },
  { id: 2, title: "Зельеварение", description: "Приготовление сложных составов: от жидкой удачи Феликс Фелицис до Оборотного зелья." },
  { id: 3, title: "Трансфигурация", description: "Искусство превращения спичек в иголки, а крыс — в кубки для вина." },
  { id: 4, title: "Прорицание", description: "Гадание на кофейной гуще, чтение хрустальных шаров и предсказание мрака." },
];

let nextCourseId = 5;
const coursesRepository = {
  get: () => hogwartsCourses,
  find: (id) => hogwartsCourses.find((course) => String(course.id) === String(id)),
  save: (course) => {
    course.id = nextCourseId++;
    hogwartsCourses.push(course);
    return course;
  },
};
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
    console.log('--- СПИСОК ИМЕНОВАННЫХ МАРШРУТОВ ---');
  console.log(fastify.reverse); 
}