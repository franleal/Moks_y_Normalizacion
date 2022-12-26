class fakerController{
    constructor(){
        this.product=[]
    }

    save(obj){
        let newId
        if (this.product.length == 0){
            newId = 1
        }else{
            newId =  this.product[this.product.length-1].id +1
        }

        const newProduct = {...obj,id:newId}
        this.product.push(newProduct)
        return newProduct
    }

    getAll(){
        return [...this.product]
    }

}

module.exports = fakerController