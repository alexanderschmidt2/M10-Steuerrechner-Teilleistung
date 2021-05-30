window.addEventListener("load", init);

var dom_inhalt = [];
var daten_cache;
var url_server = "http://localhost:3000/php/server_logik.php";


//funktion: nomen_verb
// wir laden uns eine Konfiguration 


function init() {
    laender_hinzufuegen();
};

function laender_hinzufuegen() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url_server + "?auswahl=land");
    xhr.send();
    xhr.addEventListener("load", function() { //Definitv ein paar Hilfeboxen überlegen
        if (xhr.status != 200) {
            box_machen("fehler", "1", null, null, "Es ist ein Fehler aufgetreten")

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
                        let eingabe_antwort = JSON.parse(xhr.responseText);
                        if (eingabe_antwort[0] == "0") {
                            box_machen("input", "3", "warenwert", null, "Warenwert in €");
                            warenwert_auswahl = document.getElementById("warenwert");
                            warenwert_auswahl.addEventListener("change", function() {
                                muellsammler("4");
                                rechner(warenwert_auswahl, land_ausgewaehlt, ware_ausgewaehlt)
                            });
                        } else {
                            box_machen("fehler", "3", null, null, eingabe_antwort[1])
                        };
                    }
                });
            }

        })
    }
};

function rechner(warenwert_auswahl, land_ausgewaehlt, ware_ausgewaehlt) {
    box_machen("button", "4", "knopf_berechnen", "berechnen", "hier klicken zum Berechnen");
    warenwert_ausgewaehlt = warenwert_auswahl.value;
    warenwert_ausgewahlt = toString(warenwert_ausgewaehlt);
    document.getElementById("knopf_berechnen").addEventListener("click", function() {
        muellsammler("4");
        let xhr = new XMLHttpRequest(); //SEHR unschön, eine Information, die der Server schon hat, muss nachgeschickt werden
        xhr.open("GET", url_server + "?auswahl=rechner&warenwert=" + warenwert_ausgewaehlt +
            "&landwahl=" + land_ausgewaehlt + "&warenwahl=" + ware_ausgewaehlt);
        xhr.send();
        xhr.addEventListener("load", function() {
            if (xhr.status != 200) {
                console.log("hier");
                box_machen("fehler", "5", null, null, "Es ist ein Fehler aufgetreten");
            } else {
                let ergebnis = JSON.parse(xhr.responseText);
                box_machen("ergebnis", "5", "ergebnis", ergebnis, null);

            }
        })

    });

};


function box_machen(eingabe_art, box_id, eingabe_id, eingabe_parameter, beschreibung) { //Wenn es diese Box bereits gibt muss die Box entfernt werden und durch eine neue Box mit entsprechendem Level ersetzt werden!
    let box = document.createElement("div");
    box.id = box_id;
    dom_inhalt.push(box_id);
    if (eingabe_art != "fehler" && eingabe_art != "ergebnis") {
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
        }
        box.appendChild(eingabe_label);
        box.appendChild(eingabe);
    } else if (eingabe_art == "ergebnis") {
        let ergebniswert = document.createElement("p");
        let ergebnisbeschreibung = document.createElement("p");
        ergebniswert.innerHTML = eingabe_parameter[0];
        ergebnisbeschreibung.innerHTML = eingabe_parameter[1];
        box.appendChild(ergebniswert);
        box.appendChild(ergebnisbeschreibung);
    } else {
        fehler_text = document.createElement("p");
        fehler_text.innerHTML = beschreibung;
        box.appendChild(fehler_text);
    }
    document.getElementById("abgabenrechner").appendChild(box);

};

function muellsammler(id) { //WORKAROUND, bis ich mich mit SW beraten habe
    switch (id) {
        case "2":
            if (document.getElementById("2") != null) {
                document.getElementById("2").remove();
            }
            if (document.getElementById("3") != null) {
                document.getElementById("3").remove();
            }
            if (document.getElementById("4") != null) {
                document.getElementById("4").remove();
            }
            if (document.getElementById("4") != null) {
                document.getElementById("4").remove();
            }
        case "3":
            if (document.getElementById("3") != null) {
                document.getElementById("3").remove();
            }
            if (document.getElementById("4") != null) {
                document.getElementById("4").remove();
            }
            if (document.getElementById("5") != null) {
                document.getElementById("5").remove();
            }
        case "4":
            if (document.getElementById("4") != null) {
                document.getElementById("4").remove();
            }
            if (document.getElementById("5") != null) {
                document.getElementById("5").remove();
            }

    }


};


function cache_laden() {};