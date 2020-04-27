const express = require('express'); //iniciando express

const app = express(); //pegando os recursos do express

//para identificar um json
app.use(express.json());
const { uuid, isUuid } = require('uuidv4');

const projects = [];

//middleware para dar log quando é feito algum request
function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.log(logLabel);
  // console.time(logLabel);

  return next(); //Próximo middleware

  // console.timeEnd(logLabel);
}


//middleware para verificar se o id passado por parãmetro é válido.
function validateProjectId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid project ID.' });
  }

  return next();
}



app.use(logRequests);



//busca informações dos projetos
app.get('/projects', (request, response) => {
  const { title } = request.query;

  const results = title
    ? projects.filter(project => project.title.includes(title))
    : projects;

  return response.json(results);
});

//Inserir um projeto
app.post('/projects', (request, response) => {
  const { title, owner } = request.body;

  const project = { id: uuid(), title, owner };

  projects.push(project);

  return response.json(project);
});

//Atualizar um projeto
app.put('/projects/:id', validateProjectId, (request, response) => {
  const { id } = request.params;
  const { title, owner } = request.body;

  //a variavel vai guardar a posicão projeto do array que contém o mesmo id recebido por parâmetro
  const projectIndex = projects.findIndex(project => project.id === id);

  //validação para caso não existe o id buscado, retornar uma mensagem de erro com status 400
  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found." });
  }

  //cria um novo projeto com as novas informações
  const project = {
    id,
    title,
    owner,
  }

  //substituiu pelo index, o novo projeto.
  projects[projectIndex] = project;

  return response.json(project);

});

//Deletar um projeto
app.delete('/projects/:id', validateProjectId, (request, response) => {
  const { id } = request.params;

  const projectIndex = projects.findIndex(project => project.id === id);

  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found." });
  }

  //aqui é deletado o item do array, passando o index e a quantidade de itens a serem deletados.
  projects.splice(projectIndex, 1);

  return response.status(204).send();

});



//escutar a aplicação na porta localhost:3333
app.listen(3333, () => {
  console.log('Back-end started!');
}); 