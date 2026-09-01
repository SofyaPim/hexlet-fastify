import yup from "yup";
let usersCollection = [];
let nextId = 1;

const usersRepository = {
  get: () => usersCollection,
  find: (id) => usersCollection.find((user) => String(user.id) === String(id)),
  save: (user) => {
    user.id = nextId++;
    usersCollection.push(user);
    return user;
  },
};

export default async function (fastify, opts) {
 
  fastify.get('/users', { name: 'users' }, async function (request, reply) {
    const users = usersRepository.get();
    return reply.view('users/index.eta', { users, reverse: fastify.reverse.bind(fastify) });
  });

 
  fastify.get('/users/new', { name: 'newUserForm' }, async function (request, reply) {
    return reply.view('users/new.eta', { reverse: fastify.reverse.bind(fastify) });
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
         };
 
         return reply.view("/users/new", data);
       }
       const user = {
         username: username.trim(),
         email: email.trim().toLowerCase(),
         password: password,
       };      
       usersRepository.save(user);
       // return reply.redirect("/users");
         return reply.redirect(fastify.reverse('users'));
     },
   );

  fastify.get('/users/:id', async function (request, reply) {
    const user = usersRepository.find(request.params.id);
    if (!user) return reply.status(404).send("User not found");
    return reply.view("users/show.eta", { user });
  });
}