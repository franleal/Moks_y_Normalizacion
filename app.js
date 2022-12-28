/* Importacion de librerias internas y externas */
const express = require("express");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const bp = require("body-parser");
const routers = require("./public/routers");
const handlebars = require("express-handlebars");
const Contenedor = require("./controllers/SQLController.js");
const contenedorFaker = require("./api/productosFaker")
const options = require("./controllers/options.js");
const moment = require("moment/moment");
const productos = new Contenedor(options.mysql, "productos");
const productosFaker = new contenedorFaker()
const messages = new Contenedor(options.mysql, "mensajes");
const {normalize,schema} = require('normalizr')
const util = require('util')

/* Inicializacion de la configuracion */
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const PORT = 8080;

/* middlewares incorporados */
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.engine(
    "hbs",
    handlebars.engine({
        extname: "hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views",
    })
);

app.set("views", "./views");
app.set("view engine", "hbs");

app.use("/", routers);
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("welcome", {
        style: "welcome.css",
        title: "Bienvenido",
    });
});

app.get("/api/productos-test",async (req,res) =>{
    try{
        const allProducts = await productosFaker.getAll()
        res.render("productosFaker", {
            products :allProducts,
            style:"faker.css",
            title: "Productos Aleatorios Faker"
        })
    }
    catch(err){
        next(err)
    }

})

app.post('/api/productos-test',async (req,res,next)=>{
    try{
        res.json(await productosFaker.producto())
    }
    catch(err){
        next(err)

    }
})

app.post("/", async (req, res) => {
    console.log(`post req recibida con exito`);
    const data = req.body;
    console.log(data);
    const nuevoProducto = await productos.save(data);
    !data && res.status(204).json(notFound);
    res.status(201).render("productos", {});
});

httpServer.listen(PORT, () => {
    console.log(
        `Servidor http escuchando en el puerto ${httpServer.address().port}`
    );
    console.log(`http://localhost:${httpServer.address().port}`);
});
httpServer.on("error", error => console.log(`Error en servidor: ${error}`));




io.on("connection", async socket => {
    console.log("Nuevo cliente conectado");

    /* cargar los productos */
    const listaProductos = await productos.getAll();
    socket.emit("new-connection", listaProductos);
    socket.on("new-product", data => {
        productos.save(data);
        io.sockets.emit("producto", data);
        
    });

    //Normalizado-------------------------------------------------------------------------------
    const listaMensajes = await messages.getAll();
    const mensaje = new schema.Entity('mensaje')
    const allMensajes = new schema.Entity('allMensajes',{
        id:'mensajes',
        mensajes:[mensaje]
    },{idAttribute:'mensajes'})

    function print(obj){
        console.log(util.inspect(obj,false,null,true))
    }

    console.log("-----------------Normalizado:")
    const mensajesNormalizados = normalize(listaMensajes,allMensajes)
    print(mensajesNormalizados)
    
    console.log('longitud original:' + JSON.stringify(listaMensajes).length)
    console.log('longitud Normalizada:' + JSON.stringify(mensajesNormalizados).length)
    const mensajeslist=JSON.stringify(listaMensajes).length
    const mensajesNorm = JSON.stringify(mensajesNormalizados).length
    const normalizado = (mensajeslist*100)/mensajesNorm
    
    //Para enviar todos los mensajes en la primera conexion
    socket.emit('messages', listaMensajes,normalizado);
    socket.emit('messages', normalizado)

  //Evento para recibir nuevos mensajes
    socket.on('new-message', async data => {
        data.time = moment(new Date()).format('DD/MM/YYYY hh:mm:ss');
        await messages.saveMessages(data);
        const listaMensajes = await messages.getAll();
        io.sockets.emit('messages', listaMensajes);
    });

});
