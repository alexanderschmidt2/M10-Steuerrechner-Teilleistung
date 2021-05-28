window.addEventListener("load", init);

var dom_inhalt;
var daten_cache;

//funktion: nomen_verb

function init() {
    laender_hinzufuegen();
    //waren_hinzufuegen();
    //eingabe_hinzufeugen();
};

function laender_hinzufuegen() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/php/laendernamen.php");
    xhr.send();
    xhr.addEventListener("load", function() {
        if (xhr.status != 200) {
            console.log("Fehler");
        } else {
            console.log(xhr.responseText);
        }
    })
};

function cache_laden() {};