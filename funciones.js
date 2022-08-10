const fs = require("fs").promises;

//esta funcion nos permite leer el formulario
const getForm = function (req) {
  return new Promise((res, rej) => {
    let str = "";
    req.on("data", function (chunk) {
      str += chunk;
    });
    req.on("end", function () {
      //console.log('str', str);
      const obj = JSON.parse(str);
      res(obj);
    });
  });
};
async function editarHistorial (id,nombre,desc,monto){

  let archivo_db = await fs.readFile("db.json", "utf8");
  // 2. Transformamos su contenido (string) a un objeto de JS
  archivo_db = JSON.parse(archivo_db);
  const gasto =  archivo_db.gastos.find(g => g.id == id)

  gasto.roommates = nombre
  gasto.descripcion = desc
  gasto.monto = monto

  archivo_db = JSON.stringify(archivo_db); 
  await fs.writeFile("db.json", archivo_db, "utf8");
};
// _____________________________________________________________________________
const insertarRoommates = async function (nuevoRoommates) {
  // 1. Leemos el contenido del archivo 'db.json'
  let archivo_db = await fs.readFile("db.json", "utf8");
  // 2. Transformamos su contenido (string) a un objeto de JSON
  archivo_db = JSON.parse(archivo_db);
  // 3. Le agregamos el nuevo usuario al array 'users
  archivo_db.roommates.push(nuevoRoommates);
  // 4. Volvemos a transformar el contenido a String
  archivo_db = JSON.stringify(archivo_db);
  // 5. Sobreescribimos el contenido del archivo 'db.json' 
  await fs.writeFile("db.json", archivo_db, "utf8");
};
const mostrarRoommates = async function () {
  // 1. Leemos el contenido del archivo 'db.json'
  let archivo_db = await fs.readFile("db.json", "utf8");
  // 2. Transformamos su contenido (string) a un objeto de JSON
  archivo_db = JSON.parse(archivo_db);
  // 2.5 calculas  el "debe" y ek "recibe"
  let debe = 0
  for (let gasto of archivo_db.gastos){
    debe += gasto.monto
  }

  debe = debe / archivo_db.roommates.length
  // debe /= archivo_db.roommates.length   (metodo mas corto)

    for (let roomie of archivo_db.roommates) {
      //RECIBE
      const gastos_roomie = archivo_db.gastos.filter(g => g.roommates
        == roomie.nombre)
      let recibe_roomie = 0
      for (let gasto of gastos_roomie) {
        recibe_roomie += gasto.monto
      }
      roomie.recibe = recibe_roomie
      //DEBE
      roomie.debe = debe

    }
  // 3. Retornar la propiedad 'users' del archivo leído
  //console.log(archivo_db)
  return archivo_db.roommates;
};
// ___________________________________________________________________________
const insertarGastos = async function (nuevoGasto) {
  let archivo_db = await fs.readFile("db.json", "utf8"); // 1. Leemos el contenido del archivo 'db.json'
  archivo_db = JSON.parse(archivo_db); // 2. Transformamos su contenido (string) a un objeto de JS

  archivo_db.gastos.push(nuevoGasto); // 3. Le agregamos el nuevo usuario al array 'users
  
  archivo_db = JSON.stringify(archivo_db); // 4. Volvemos a transformar el contenido a String
  await fs.writeFile("db.json", archivo_db, "utf8"); // 5. Sobreescribimos el contenido del archivo 'db.json'
};
const mostrarGastos = async function () {
  // 1. Leemos el contenido del archivo 'db.json'
  let archivo_db = await fs.readFile("db.json", "utf8");
  // 2. Transformamos su contenido (string) a un objeto de JS
  archivo_db = JSON.parse(archivo_db);
  // 3. Retornar la propiedad 'users' del archivo leído
  //console.log(archivo_db)
  return archivo_db.gastos;
};
const eliminarGasto = async (id) => {
  let archivo_db = await fs.readFile("db.json", "utf8");
  archivo_db = JSON.parse(archivo_db);


  //_____________________________modificar debe recibe roommates_________________________
  //obtengo datos del historico de gasto seleccionado
  let archivo_db2 = archivo_db.gastos.filter((gasto) => gasto.id == id); // array de gasto filtrado
  let nombre = archivo_db2[0].roommates; //obtengo nombre de la tabla gasto
  let monto = archivo_db2[0].monto; //obtengo nombre de la tabla gasto

  for (let r = 0; r < archivo_db.roommates.length; r++) {
    // recorre los roommates
    //modificar el recibe
    if (nombre == archivo_db.roommates[r].nombre) {
      let recibe = archivo_db.roommates[r].recibe - monto;
      archivo_db.roommates[r].recibe = recibe;
    }
    let nuevoDebe = archivo_db.roommates[r].debe - (monto / archivo_db.roommates.length);
    archivo_db.roommates[r].debe = Math.max(nuevoDebe, 0);
  }

  //_______________________________________Eliminar Gasto________________________
  archivo_db.gastos = archivo_db.gastos.filter((gasto) => gasto.id != id);
  //trasformo el dato en texto
  archivo_db = JSON.stringify(archivo_db);
  //Guardo el archivo
  await fs.writeFile("db.json", archivo_db, "utf8");
};


module.exports = { getForm,insertarRoommates,mostrarRoommates,insertarGastos,
  mostrarGastos, eliminarGasto,editarHistorial
  
};