const socket = io.connect();
socket.on("messages", normalizado => {
    render2(normalizado);
});
socket.on("messages", data => {
    render(data);
});


function addMessage(){
    
    const message = {
        id: document.getElementById("email").value,
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        edad: document.getElementById("edad").value,
        alias: document.getElementById("alias").value,
        avatar: document.getElementById("img").value,
        text: document.getElementById("text").value,
    }
    if (!message.id) {
        alert(
            "Por favor, introduzca un email para mandar un mensaje en el chat"
        );
    }else {
        socket.emit('new-message',message)
    }
     
    return false
}

function render(data){
    const html = data.map((elem,index)=>{
        return(
            `<div>
                <strong style="color:blue ;">${elem.id}</strong>:
                <strong>${elem.nombre}</strong>:
                <strong>${elem.apellido}</strong>:
                <strong>${elem.edad}</strong>:
                <strong>${elem.alias}</strong>:
                <img>${elem.avatar}</img>:
                <em style="color:green ;">${elem.text}</em>
            </div>
            `
        )
    }).join(' ')

    document.getElementById('messages').innerHTML = html
}

function render2(normalizado){
    
    const html = `<h2>Chat normalizado al ${normalizado}%</h2>`
    document.getElementById("porcentaje").innerHTML = html
    return(html)
    
}

