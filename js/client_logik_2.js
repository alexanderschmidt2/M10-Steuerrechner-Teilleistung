window.addEventListener("load", init);

var dom_inhalt = [];
var daten_cache;
var url_server = "http://localhost:3000/php/server_logik.php";


//funktion: nomen_verb
// wir laden uns eine Konfiguration 


function init() {
    laender_hinzufuegen();

    //eingabe_hinzufeugen();
};

function laender_hinzufuegen() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url_server + "?auswahl=land");
    xhr.send();
    xhr.addEventListener("load", function() { //Definitv ein paar Hilfeboxen überlegen
        if (xhr.status != 200) {
            box_machen("fehler", "1", null, null, "Es ist ein Fehler aufgetreten")
            console.log("Fehler ist aufgetreten, Server nicht erreichbar");
        } else {
            box_machen("select", "1", "land", JSON.parse(xhr.responseText), "Land"); //Muellsammler Rework, muss besser klappen,
            waren_hinzufuegen();
        }
    })
};



function waren_hinzufuegen() { //TODO: FIX mit Default Option
    let land_auswahl = document.getElementById("land");
    if (land_auswahl != null) {
        land_auswahl.addEventListener("change", function() { //AN DEN LÄNDERN ÄNDERT SICH WAS
            muellsammler("2");
            muellsammler("3");
            land_ausgewaehlt = land_auswahl.value
            if (land_ausgewaehlt != "default") {
                let xhr = new XMLHttpRequest(); //konsolidieren mit der Länderwahl? 
                xhr.open("GET", url_server + "?auswahl=einfuhr&landwahl=" + land_ausgewaehlt); //ZU VIEL? SW FRAGEN
                xhr.send();
                xhr.addEventListener("load", function() {
                    if (xhr.status != 200) {
                        box_machen("fehler", "2", null, null, "Es ist ein Fehler aufgetreten") //TODO: AUF DIE FEHLERART ANPASSEN
                    } else {
                        let laender_einfuhr = JSON.parse(xhr.responseText);
                        if (laender_einfuhr[0] == 1) {
                            let xhr = new XMLHttpRequest();
                            xhr.open("GET", url_server + "?auswahl=waren");
                            xhr.send();
                            xhr.addEventListener("load", function() {
                                if (xhr.status != 200) {
                                    box_machen("fehler", "2", null, null, "Es ist ein Fehler aufgetreten hier");
                                } else {
                                    box_machen("select", "2", "ware", JSON.parse(xhr.responseText), "Waren");
                                    eingabe_hinzufeugen(land_ausgewaehlt);
                                }
                            })
                        } else {
                            box_machen("fehler", "2", null, null, laender_einfuhr[1]) //TODO: AUF DIE FEHLERART ANPASSEN im php, wenn Einfuhr der Waren generell verboten
                        }
                    }
                })
            }
        })
    }
};

function eingabe_hinzufeugen(land_ausgewaehlt) {
    let waren_auswahl = document.getElementById("ware");
    if (waren_auswahl != null) {
        waren_auswahl.addEventListener("change", function() { //AN DEN WAREN ÄNDERT SICH was
            muellsammler("3");
            ware_ausgewaehlt = waren_auswahl.value;
            if (ware_ausgewaehlt != "default") {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url_server + "?auswahl=einfuhr_verbot&landwahl=" + land_ausgewaehlt + "&warenwahl=" + ware_ausgewaehlt);
                xhr.send();
                xhr.addEventListener("load", function() {
                    if (xhr.status != 200) {
                        box_machen("fehler", "3", null, null, "Es ist ein Fehler aufgetreten");
                    } else {
                        console.log(xhr.responseText);
                        let eingabe_antwort = JSON.parse(xhr.responseText);
                        if (eingabe_antwort[0] == "0") {
                            box_machen("input", "3", "warenwert", null, "Warenwert in €");
                            warenwert_auswahl = document.getElementById("warenwert");
                            warenwert_ausgewaehlt = warenwert_auswahl.value;
                            warenwert_auswahl.addEventListener("change", function() { rechner(warenwert_ausgewaehlt, land_ausgewaehlt, ware_ausgewaehlt) });
                        } else {
                            box_machen("fehler", "3", null, null, eingabe_antwort[1])
                        };
                    }
                });
            }

        })
    }
};

function rechner(warenwert_ausgewaehlt, land_ausgewaehlt, ware_ausgewaehlt) {
    box_machen("button", "3", "knopf_berechnen", "berechnen", "hier klicken zum Berechnen");
    document.getElementById("knopf_berechnen").addEventListener("click", function() {
        let xhr = new XMLHttpRequest(); //SEHR unschön, eine Information, die der Server schon hat, muss nachgeschickt werden
        xhr.open("GET", url_server + "?auswahl=rechner&warenwert=" + warenwert_ausgewaehlt +
            "&landwahl=" + land_ausgewaehlt + "&warenwahl=" + ware_ausgewaehlt);
        xhr.send();
        xhr.addEventListener("load", function() {
            if (xhr.status != 200) {
                box_machen("fehler", "4", null, null, "Es ist ein Fehler aufgetreten");
            } else {
                console.log(xhr.responseText);
            }
        })

    });

};


function box_machen(eingabe_art, box_id, eingabe_id, eingabe_parameter, beschreibung) { //Wenn es diese Box bereits gibt muss die Box entfernt werden und durch eine neue Box mit entsprechendem Level ersetzt werden!
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
            }
        } else if (eingabe.tagName == "INPUT") { //TODO: Default Input ergänzen, constraints ergänzen
            eingabe.setAttribute("type", "number");
            eingabe.setAttribute("min", 1);
            eingabe.setAttribute("max", 100000);
        } else if (eingabe.tagName == "BUTTON") {
            eingabe.innerHTML = eingabe_parameter;

        };
        box.appendChild(eingabe_label);
        box.appendChild(eingabe);
        document.getElementById("abgabenrechner").appendChild(box);
        dom_inhalt.push(box_id);
    } else {
        fehler_text = document.createElement("p");
        fehler_text.innerHTML = beschreibung;
        box.appendChild(fehler_text);
        dom_inhalt.push(box_id);
        document.getElementById("abgabenrechner").appendChild(box);

    }
};




function muellsammler(id) {
    while (dom_inhalt.indexOf(id) != -1) {
        document.getElementById("abgabenrechner").removeChild(document.getElementById(id));
        dom_inhalt = dom_inhalt.filter(function(e) { return e !== id });
        id = toString(parseInt(id) + 1)
    }
};

function cache_laden() {};