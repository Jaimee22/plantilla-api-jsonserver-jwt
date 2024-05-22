//Importación de los módulos
const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');

//Configuracion del Servidor y Base de Datos
const server = jsonServer.create();
const router = jsonServer.router(__dirname + '/../database.json');
const userdb = JSON.parse(fs.readFileSync(__dirname + '/../users.json', 'UTF-8'));

//Configuracion del servidor
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

//Configuracion del JWT
const SECRET_KEY = '123456789';
const expiresIn = '1h';

//Funciones Auxiliares para JWT
// Funcion para crear el Token(pasando payload y cuando expira)
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Funcion para verificar un token JWT y devuelve el payload decodificado o un error
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err);
}

// Función para Verificar la Autenticación de Usuarios 
//(Verifica si un usuario con el email y contraseña proporcionados existe en la base de datos)
function isAuthenticated({ email, password }) {
  return userdb.users.findIndex(user => user.email === email && user.password === password) !== -1;
}


// Endpoint de Registro de Usuarios
/* 1º Verifica si el usuario ya existe.
   2º Si no existe, lo agrega a users.json.
   3º Crea un token JWT y lo devuelve al cliente. */
server.post('/auth/register', (req, res) => {
  console.log("register endpoint called; request body:");
  console.log(req.body);
  const { email, password } = req.body;

  if (isAuthenticated({ email, password }) === true) {
    const status = 401;
    const message = 'Email and Password already exist';
    res.status(status).json({ status, message });
    return;
  }

  fs.readFile(__dirname + '/../users.json', (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }

    // Coge los usuarios existentes
    var data = JSON.parse(data.toString());

    // Coger el ultimo id del usuario
    var last_item_id = data.users[data.users.length - 1].id;

    // Añadir nuevo usuario
    data.users.push({ id: last_item_id + 1, email: email, password: password });
    fs.writeFile(__dirname + '/../users.json', JSON.stringify(data), (err, result) => {
      if (err) {
        const status = 401;
        const message = err;
        res.status(status).json({ status, message });
        return;
      }
    });
  });

  // Generar token para el usuario
  const access_token = createToken({ email, password });
  console.log("Access Token:" + access_token);
  res.status(200).json({ access_token });
});





// Endpoint de Inicio de Sesion
server.post('/auth/login', (req, res) => {
  console.log("login endpoint called; request body:");
  console.log(req.body);
  // Verifica las credenciales del usuario.
  const { email, password } = req.body;
  if (isAuthenticated({ email, password }) === false) {
    const status = 401;
    const message = 'Incorrect email or password';
    res.status(status).json({ status, message });
    return;
  }
  // Si son correctas, crea un token JWT y lo devuelve al cliente.
  const access_token = createToken({ email, password });
  console.log("Access Token:" + access_token);
  res.status(200).json({ access_token });
});


//Proteger Rutas
server.use(/^(?!\/auth).*$/, (req, res, next) => {
  // Verifica que la solicitud tenga un token JWT en el encabezado de autorización.
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401;
    const message = 'Error in authorization format';
    res.status(status).json({ status, message });
    return;
  }
  try {
    // Si el token es válido, permite el acceso a las rutas protegidas.
    let verifyTokenResult;
    verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

    if (verifyTokenResult instanceof Error) {
      const status = 401;
      const message = 'Access token not provided';
      res.status(status).json({ status, message });
      return;
    }
    next();
  } catch (err) {
    const status = 401;
    const message = 'Error access_token is revoked';
    res.status(status).json({ status, message });
  }
});

// Monta el router de json-server
server.use(router);

// Inicia el servidor en el puerto 8000 y muestra un mensaje en la consola
server.listen(8000, () => {
  console.log('Run Auth API Server');
});
