window.addEventListener("load", init);

var dom_inhalt = [];
var daten_cache;

//funktion: nomen_verb

function init() {
    laender_hinzufuegen();

    //eingabe_hinzufeugen();
};

function laender_hinzufuegen() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/php/laendernamen.php");
    xhr.send();
    xhr.addEventListener("load", function() { //Definitv ein paar Hilfeboxen überlegen
        if (xhr.status != 200) {
            //Fehlerbox
            console.log("Fehler ist aufgetreten, Server nicht erreichbar");
        } else {
            box_machen("select", "test", "land", JSON.parse(xhr.responseText), "Land");
            waren_hinzufuegen();
        }
    })
};

function waren_hinzufuegen() {
    let land_auswahl = document.getElementById("land");
    if (land_auswahl != null) {
        console.log("drin");
        document.getElementById("land").addEventListener("change", function() {
            muellsammler();
            land_ausgewaehlt = document.getElementById("land").value
            if (land_ausgewaehlt != "default") {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", "http://localhost:3000/php/laendereinfuhr.php" + "?" + "land=" + land_ausgewaehlt);
                xhr.send();
                xhr.addEventListener("load", function() {
                    if (xhr.status != 200) {
                        //Fehlerbox
                        console.log("Fehler ist aufgetreten, Server nicht erreichbar");
                    } else {
                        let laender_einfuhr = JSON.parse(xhr.responseText);
                        if (laender_einfuhr[0] == 1) {
                            let xhr = new XMLHttpRequest();
                            xhr.open("GET", "http://localhost:3000/php/warennamen.php");
                            xhr.send();
                            xhr.addEventListener("load", function() { box_machen("select", "test1", "ware", JSON.parse(xhr.responseText), "Waren"); })

                        } else {
                            //fehlerbox
                        }
                    }
                })
            }

            //was ist der einfuhrstatus?     
        })
    }
};

function box_machen(eingabe_art, box_id, eingabe_id, eingabe_parameter, label_beschreibung) {
    let box = document.createElement("div");
    box.id = box_id;
    let eingabe = document.createElement(eingabe_art);
    eingabe.id = eingabe_id;
    let eingabe_label = document.createElement("label");
    eingabe_label.innerHTML = label_beschreibung;
    eingabe_label.htmlFor = eingabe_id;
    if (eingabe.tagName == "SELECT") {
        console.log("funktioniert");
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

    };
};


function muellsammler() {
    if (dom_inhalt.peek != undefined) {
        document.getElementById("abgabenrechner").removeChild(dom_inhalt.peek());
        dom_inhalt.pop()
    }
};

function cache_laden() {};