import yup from "yup";




export default async function (fastify, opts) {
 
  


  fastify.get('/users', { name: 'users' }, async function (request, reply) {
    const users = fastify.usersRepository.get();
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
           flash: [{ type: 'danger', message: 'Ошибка регистрации: проверьте корректность введённых данных' }]
         };
 
         

         return reply.view("users/new.eta", data);
       }

       // 2. ЕСЛИ ВСЁ ПРОШЛО УСПЕШНО
       const user = {
         username: username.trim(),
         email: email.trim().toLowerCase(),
         password: password,
       };      
       
       fastify.usersRepository.save(user);
       
       request.flash("success", "Вы успешно зарегистрировались в системе!");
       
       return reply.redirect(fastify.reverse('users'));
     },
   );

  fastify.get('/users/:id', async function (request, reply) {
    const user = fastify.usersRepository.find(request.params.id);
    if (!user) return reply.status(404).send("User not found");
    return reply.view("users/show.eta", { user });
  });
}

