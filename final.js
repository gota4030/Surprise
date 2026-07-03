function createFirework(){

    const fire = document.createElement("div");

    fire.classList.add("firework");

    fire.style.left = Math.random()*100 + "vw";
    fire.style.top = Math.random()*100 + "vh";

    document.body.appendChild(fire);

    setTimeout(()=>{
        fire.remove();
    },1000);

}

// chuva de fogos
setInterval(createFirework, 200);

// opcional: redirecionar depois
setTimeout(()=>{
    // window.location.href = "index.html";
},6000);