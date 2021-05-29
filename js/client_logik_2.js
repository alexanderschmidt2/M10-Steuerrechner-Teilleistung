window.addEventListener("load", init);

var dom_inhalt = [];
var daten_cache;


//funktion: nomen_verb
// wir laden uns eine Konfiguration 


function init() {
    laender_hinzufuegen();
    //eingabe_hinzufeugen();
};

function laender_hinzufuegen() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/php/server_logik.php?auswahl=land");
    xhr.send();
    xhr.addEventListener("load", function() { //Definitv ein paar Hilfeboxen überlegen
        if (xhr.status != 200) {
            box_machen("fehler", "level_1", null, null, "Es ist ein Fehler aufgetreten")
                //TODO: AUF DIE FEHLERART ANPASSEN
            console.log("Fehler ist aufgetreten, Server nicht erreichbar");
        } else {
            box_machen("select", "level_1", "land", JSON.parse(xhr.responseText), "Land");
            waren_hinzufuegen();
            console.log(xhr.responseText);

        }
    })
};



function waren_hinzufuegen() {
    let land_auswahl = document.getElementById("land");
    if (land_auswahl != null) {
        document.getElementById("land").addEventListener("change", function() {
            land_ausgewaehlt = document.getElementById("land").value
            if (land_ausgewaehlt != "default") {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", "http://localhost:3000/php/server_logik.php?" + "auswahl=einfuhr&landwahl=" + land_ausgewaehlt);
                xhr.send();
                xhr.addEventListener("load", function() {
                    if (xhr.status != 200) {
                        box_machen("fehler", "level_2", null, null, "Es ist ein Fehler aufgetreten") //TODO: AUF DIE FEHLERART ANPASSEN
                    } else {
                        let laender_einfuhr = JSON.parse(xhr.responseText);
                        if (laender_einfuhr[0] == 1) {
                            let xhr = new XMLHttpRequest();
                            xhr.open("GET", "http://localhost:3000/php/server_logik.php?auswahl=waren");
                            xhr.send();
                            xhr.addEventListener("load", function() { box_machen("select", "level_2", "ware", JSON.parse(xhr.responseText), "Waren"); })
                        } else {
                            box_machen("fehler", "level_2", null, null, laender_einfuhr[1]) //TODO: AUF DIE FEHLERART ANPASSEN
                        }
                    }
                })
            }

            //was ist der einfuhrstatus?     
        })
    }
};

function box_machen(eingabe_art, box_id, eingabe_id, eingabe_parameter, beschreibung) {
    muellsammler(box_id); //Wenn es diese Box bereits gibt muss die Box entfernt werden und durch eine neue Box mit entsprechendem Level ersetzt werden!
    let box = document.createElement("div");
    box.id = box_id;
    if (eingabe_art != "fehler") {
        let eingabe = document.createElement(eingabe_art);
        eingabe.id = eingabe_id;
        let eingabe_label = document.createElement("label");
        eingabe_label.innerHTML = beschreibung;
        eingabe_label.htmlFor = eingabe_id;
        if (eingabe.tagName == "SELECT") {
            let default_option = document.createElement("option");
            default_option.value = "default";
            default_option.innerHTML = "hier auswählen";
            eingabe.appendChild(default_option);
            for (let i = 0; i < eingabe_parameter.length; i++) {
                option = document.createElement("option");
                option.innerHTML = eingabe_parameter[i];
                option.value = eingabe_parameter[i];
                eingabe.appendChild(option);
            };
            box.appendChild(eingabe_label);
            box.appendChild(eingabe);
            document.getElementById("abgabenrechner").appendChild(box);
            dom_inhalt.push(box_id);
        };
    } else {
        fehler_text = document.createElement("p");
        fehler_text.innerHTML = beschreibung;
        box.appendChild(fehler_text);
        dom_inhalt.push(box_id);
        document.getElementById("abgabenrechner").appendChild(box);

    }
};




function muellsammler(id) {
    if (dom_inhalt.indexOf(id) != -1) {
        document.getElementById("abgabenrechner").removeChild(document.getElementById(id));
        dom_inhalt = dom_inhalt.filter(function(e) { return e !== id });
    }

};

function cache_laden() {};