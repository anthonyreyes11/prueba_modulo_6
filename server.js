const express = require("express");
const axios = require("axios");
const uuid = require("uuid");
const fs = require("fs").promises;
const nodemailer = require('nodemailer');
//const bodyParser =require('body-parser')

const app = express();
app.use(express.static("public"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//nos traemos las funciones del archivo funciones
const{
  getForm, insertarRoommates,mostrarRoommates,
  insertarGastos,mostrarGastos,eliminarGasto,editarHistorial
} = require('./funciones.js')

const {transport, enviar} = require('./email.js')

//_____________________________________________________________________________
app.post("/roommates", async (req, res) => {
  const resp = await axios.get("https://randomuser.me/api");
  const datos = resp.data;
  //console.log(resp.data)
  const nombre = `${datos.results[0].name.first} ${datos.results[0].name.last}`;

  //obtener id
  const id_unico = uuid.v4();
  // creamos un objeto para ingresar con esos datos a un nuevo roommates
  const nuevoRoommates = {
    id: id_unico,
    nombre: nombre,
  };
  
  await insertarRoommates(nuevoRoommates);
  
  transport.sendMail(enviar, function (err, info) {
    if (err) {
      console.log('enviading');
      console.log('error', err);
    } else {
      console.log(info);
    }
  })
  res.json({});
});

app.get("/roommates", async (req, res) => {
  let roommates = await mostrarRoommates();
  res.json({ roommates });
});
// ________________________________________________________________
app.post("/gastos", async (req, res) => {
  //obtener datos
  // 1. Recuperamos datos del formulario
  const gasto = await getForm(req);
  // 2. recuperar los datos del formulario
  const nombreRoommates = gasto.roommates; //nombre roommates
  const descripcion = gasto.descripcion;
  const monto = gasto.monto;
  //obtener id
  const id_gasto = uuid.v4();
  if (monto == 0) {
    return;
  }
  //_________________________________________________________
  let archivo_db = await fs.readFile("db.json", "utf8");
  archivo_db = JSON.parse(archivo_db);

  for (let r = 0; r < archivo_db.roommates.length; r++) {
    let montoDebe = archivo_db.roommates[r].debe + monto / archivo_db.roommates.length; //debe
    let recibe = archivo_db.roommates[r].recibe; //recibe

    if (nombreRoommates == `${archivo_db.roommates[r].nombre}`) {
      recibe = archivo_db.roommates[r].recibe + monto;
    }
    archivo_db.roommates[r].debe = montoDebe;
    archivo_db.roommates[r].recibe = recibe;
  }
  // console.log(archivo_db)
  archivo_db = JSON.stringify(archivo_db);
  await fs.writeFile("db.json", archivo_db, "utf8");

  //_______________________________________________________
  const nuevoGasto = {
    id: id_gasto,
    roommates: nombreRoommates,
    descripcion: descripcion,
    monto: monto,
  };
  await insertarGastos(nuevoGasto);
  //se debe traer a base, tranformar a objeto ,bscar posicion,modificarlar,se vuelve a texto,se sobre escribe el archivo

  res.json({});
});
app.get("/gastos", async (req, res) => {
  let gastos = await mostrarGastos();
  res.json({ gastos });
});

app.put('/gastos', async (req, res) => {
  //se debe obtener todos los datos del modal y el id 
  const gasto = await getForm(req);
  const id = req.query.id
  const nombre = gasto.roommates
  const descripcion = gasto.descripcion
  const monto = gasto.monto
  editarHistorial(id,nombre,descripcion,monto)
  res.json({})
})

app.delete("/gastos", async (req, res) => {
  const id = req.query.id;
  //console.log(id)
  await eliminarGasto(id);
  res.redirect('/');
});

app.get("*", (req, res) => {
  res.send("Página aún no implementada");
});

app.listen(3000, function () {
  console.log(`Servidor corriendo en http://localhost:${3000}/`);
});