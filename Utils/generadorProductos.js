const { faker } = require('@faker-js/faker')
faker.locale= 'es'


function generarProductos(){
    return{
        title: faker.commerce.product() ,
        price: faker.commerce.price(),
        thumbnail:faker.image.food()
    }
}

module.exports = generarProductos()