# Json Server + JWT Auth

Este proyecto es una API con JWT Auth usando Json Server.

El código contiene página de index y cómo desplegar la API en Vercel para que sea todo funcional.

## Instalación

```bash
$ npm install
```
## Ejecutar

```bash
$ npm run start-auth
```

## Cómo loguearse / registrarse

Puedes hacer login / register enviando POST request a las siguientes rutas

```
POST http://localhost:8000/auth/login
POST http://localhost:8000/auth/register
```
con los siguientes datos

```
{
  "email": "admin@gmail.com",
  "password":"admin"
}
```

Recibirás un token de acceso con el siguiente formato

```
{
   "access_token": "<ACCESS_TOKEN>"
}
```

Para ver las rutas protegidas tendrás que añadir el token, ya que sino no tendrás acceso.

Una ruta de prueba es

```
GET http://localhost:8000/products
```

Habrá que pasarle el token de la siguiente forma

```
Authorization: Bearer <ACCESS_TOKEN>
```

## Desplegar en Vercel

La configuración de despliegue está en el archivo vercel.json.

Por lo que solo habrá que ir a vercel, darle a subir aplicación y en framework seleccionar la opción de:

*Other Frameworks*

