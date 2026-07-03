function entrar(){

    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erro");
    const fade = document.getElementById("fade");

    if(senha === "Be123"){

        erro.innerHTML = "❤️ certo...";

        // efeito cinema
        fade.classList.add("active");

        setTimeout(()=>{
            window.location.href = "carta.html";
        },1500);

    } else {

        erro.innerHTML = "Senha incorreta... 💔";

        const box = document.querySelector(".container");

        box.style.animation = "shake 0.4s";

        setTimeout(()=>{
            box.style.animation = "";
        },400);
    }
}