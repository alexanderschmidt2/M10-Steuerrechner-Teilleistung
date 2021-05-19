window.addEventListener("load", init);

function init() { //TODO@ Simon Schade, bitte den Code schöner machen und SW fragen
    let xhr_laenderdaten = new XMLHttpRequest();
    xhr_laenderdaten.open("GET", "http://127.0.0.1:5500/json/laenderdaten.json");
    xhr_laenderdaten.send();
    xhr_laenderdaten.addEventListener("load", function() { parsen(xhr_laenderdaten); })
};

function parsen(xhr_laenderdaten) {
    var laenderdaten = JSON.parse(xhr_laenderdaten.responseText);
    laenderoption(laenderdaten);
};

function laenderoption(laenderdaten) {
    console.log(laenderdaten);
    for (let i = 0; i <= laenderdaten.laender.length; i++) {
        let option = document.createElement("option");
        option.innerHTML = laenderdaten.laender[i].name;
        document.getElementById("land").appendChild(option);
    }
};