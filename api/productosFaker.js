const fakerController = require("../controllers/fakerController");
const  generarProductos = require("../Utils/generadorProductos");

class productosFaker extends fakerController{
    constructor(){
        super()
    }

    producto(){
        const productos = []
        for (let i=1; i<=5; i++){
            const nuevoProducto = generarProductos
            const guardar = this.save(nuevoProducto)
            productos.push(guardar)
        }
        return productos
    }
}

module.exports = productosFaker