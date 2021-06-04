window.addEventListener("load", laender_hinzufuegen);

var dom_inhalt = new Map();
//var url_server = "http://localhost:3000/php/server_logik.php";
//var url_server = "http://localhost/php/server_logik.php";
var url_server = "http://localhost/M10-Steuerrechner-Teilleistung/php/server_logik.php";


/*
Erster Schritt, hier werden die Länder dynamisch generiert, je nach Serverantwort und "DB" Einträgen
*/
function laender_hinzufuegen() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url_server + "?auswahl=land");
    xhr.send();
    xhr.addEventListener("load", function() {
        if (xhr.status != 200) {
            box_machen("fehler", "1", null, null, "Es ist ein Fehler aufgetreten"); //Fehlerfeld generieren
        } else {
            box_machen("select", "1", "land", JSON.parse(xhr.responseText), "Land"); //Selectfeld für Auswahl des Landes generieren
            waren_hinzufuegen();
        }
    })
};

/*
Zweiter Schritt, diese Funktion fragt dynamisch die Waren ab und generiert diese entsprechend nach Handelserlaubnis in ein Selectfeld
*/

function waren_hinzufuegen() {
    let land_auswahl = document.getElementById("land");
    if (land_auswahl != null) {
        land_auswahl.addEventListener("change", function() { //AN DEN LÄNDERN ÄNDERT SICH WAS, Kerngedanke, hier gibt es ein Event, was kaskadierend auch alle anderen Funktionsaufrufe beeinflusst
            muellsammler("2");
            land_ausgewaehlt = land_auswahl.value
            if (land_ausgewaehlt != "default") {
                let xhr = new XMLHttpRequest(); //konsolidieren mit der Länderwahl? 
                xhr.open("GET", url_server + "?auswahl=einfuhr&landwahl=" + land_ausgewaehlt);
                xhr.send();
                xhr.addEventListener("load", function() {
                    if (xhr.status != 200) {
                        box_machen("fehler", "2", null, null, "Es ist ein Fehler aufgetreten") //Fehlerfeld generieren
                    } else {
                        let laender_einfuhr = JSON.parse(xhr.responseText);
                        if (laender_einfuhr[0] == 1) {
                            let xhr = new XMLHttpRequest();
                            xhr.open("GET", url_server + "?auswahl=waren");
                            xhr.send();
                            xhr.addEventListener("load", function() {
                                if (xhr.status != 200) {
                                    box_machen("fehler", "2", null, null, "Es ist ein Fehler aufgetreten hier"); //Fehlerfeld generieren
                                } else {
                                    box_machen("select", "2", "ware", JSON.parse(xhr.responseText), "Waren"); //Selectfeld für die verschiedenen Warenarten erzeugen
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
/*
Prüft die entsprechende Input Logik und fügt das Input Feld hinzu 
*/
function eingabe_hinzufeugen(land_ausgewaehlt) {
    let waren_auswahl = document.getElementById("ware");
    if (waren_auswahl != null) {
        waren_auswahl.addEventListener("change", function() { //An der Warenauswahl ändert sich etwas
            muellsammler("3");
            ware_ausgewaehlt = waren_auswahl.value;
            if (ware_ausgewaehlt != "default") {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url_server + "?auswahl=einfuhr_verbot&landwahl=" + land_ausgewaehlt + "&warenwahl=" + ware_ausgewaehlt);
                xhr.send();
                xhr.addEventListener("load", function() {
                    if (xhr.status != 200) {
                        box_machen("fehler", "3", null, null, "Es ist ein Fehler aufgetreten"); //Fehlerfeld generieren
                    } else {
                        let eingabe_antwort = JSON.parse(xhr.responseText);
                        if (eingabe_antwort[0] == "0") {
                            box_machen("input", "3", "warenwert", null, "Warenwert in €"); //Inputfeld/Label für Eingabe des Warenwerts erzeugen
                            warenwert_auswahl = document.getElementById("warenwert");
                            warenwert_auswahl.classList.add('p-0');
                            warenwert_auswahl.addEventListener("change", function() {
                                muellsammler("4");
                                rechner(warenwert_auswahl, land_ausgewaehlt, ware_ausgewaehlt)
                            });
                        } else {
                            box_machen("fehler", "3", null, null, eingabe_antwort[1]) //Fehlerfeld generieren
                        };
                    }
                });
            }

        })
    }
};
/*
Letzter Schritt, hier wird die Berechnung initiiert, die Berechnung findet im Server statt 
*/
function rechner(warenwert_auswahl, land_ausgewaehlt, ware_ausgewaehlt) {
    box_machen("button", "4", "knopf_berechnen", "berechnen", "hier klicken zum Berechnen"); // Label und Knopf für die Berechnung des Warenwertes erzeugen
    warenwert_ausgewaehlt = warenwert_auswahl.value;
    warenwert_ausgewahlt = toString(warenwert_ausgewaehlt);
    document.getElementById("knopf_berechnen").addEventListener("click", function() {
        muellsammler("5");
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url_server + "?auswahl=rechner&warenwert=" + warenwert_ausgewaehlt +
            "&landwahl=" + land_ausgewaehlt + "&warenwahl=" + ware_ausgewaehlt);
        xhr.send();
        xhr.addEventListener("load", function() {
            if (xhr.status != 200) {
                console.log("hier");
                box_machen("fehler", "5", null, null, "Es ist ein Fehler aufgetreten"); //Fehlerfeld generieren
            } else {
                let ergebnis = JSON.parse(xhr.responseText);
                box_machen("ergebnis", "5", "ergebnis", ergebnis, null); //Ergebnis der Berechnung erzeugen

            }
        })

    });

};
/*
Die gesamte Boxgenerierung, die durch die dynamsichen Steuerfunktionen stattfindet wird für bessere Wartbarkeit und zusammenarbeit mit dem CSS Team in einer Funktion gebündelt, welche nach den jeweiligen Parametern die benötogte Box generiert 
*/
function box_machen(eingabe_art, box_id, eingabe_id, eingabe_parameter, beschreibung) { //Wenn es diese Box bereits gibt muss die Box entfernt werden und durch eine neue Box mit entsprechendem Level ersetzt werden!
    let box = document.createElement("div");
    box.id = box_id;
    //Fügt dem erzeugten div eine Klasse des Bootstrap hinzu, hier padding.
    //row gibt an, dass jede box eine Reihe hat. Wichtig für die Columns von eingabe und eingabe_label
    box.classList.add('p-2');
    box.classList.add('row');
    if (eingabe_art != "fehler" && eingabe_art != "ergebnis") {
        let eingabe = document.createElement(eingabe_art);
        //durch das Hinzufügen der Klasse fs-4 wird die Schriftgröße der Beschreibung angepasst     
        //durch das Hinzufügen der Klasse p-1 wird ein padding hinzugefügt und somit der Abstand von dem Text in der Auswahlbox und Auswahlbox erhöht.
        //col erzeugt eine neue Spalte in der Reihe     
        //rounded rundet die Ecken ab 
        eingabe.classList.add('fs-4');
        eingabe.classList.add('p-1');
        eingabe.classList.add('col');
        eingabe.classList.add('rounded');
        eingabe.id = eingabe_id;
        let eingabe_label = document.createElement("label");
        //durch das Hinzufügen der Klasse me-3 wird ein margin rechts hinzugefügt und somit der Abstand zwischen Label und Auswahlbox erhöht.
        //durch das Hinzufügen der Klasse fs-4 wird die Schriftgröße der Beschreibung angepasst
        //col erzeugt eine neue Spalte in der Reihe        
        //rounded rundet die Ecken ab
        eingabe_label.classList.add('me-3');
        eingabe_label.classList.add('fs-4');
        eingabe_label.classList.add('col');
        eingabe_label.classList.add('rounded');
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
            //Tooltip Implementierung
            if (eingabe_id == 'land') {
                eingabe.setAttribute('data-bs-toggle', 'tooltip');
                eingabe.setAttribute('data-bs-placement', 'top');
                eingabe.setAttribute('title', 'Wählen Sie hier bitte das Land aus, von welchem Sie einreisen.');
            } else {
                eingabe.setAttribute('data-bs-toggle', 'tooltip');
                eingabe.setAttribute('data-bs-placement', 'top');
                eingabe.setAttribute('title', 'Wählen Sie hier bitte die Warenart aus, welche Sie einführen möchten.');
            }

        } else if (eingabe.tagName == "INPUT") {
            eingabe.setAttribute("type", "number");
            eingabe.setAttribute("min", 1);
            eingabe.setAttribute("max", 100000);
            //Tooltip Implementierung
            eingabe.setAttribute('data-bs-toggle', 'tooltip');
            eingabe.setAttribute('data-bs-placement', 'top');
            eingabe.setAttribute('title', 'Geben Sie hier bitte den Warenwert Ihrer einzuführenden Waren an. Sollten Sie sich unsicher sein, werden Ihnen unsere Beamten bei der Wiedereinreise behilflich sein.');
        } else if (eingabe.tagName == "BUTTON") {
            eingabe.innerHTML = eingabe_parameter;
            //text-#2D6F9E verändert die Farbe
            //buttonBerechnenCss wird für den hover Effekt in CSS benötigt
            //rounded rundet die Ecken ab
            //shadow fügt einen Schatten hinzu, der Tiefe simuliert
            eingabe.classList.add('text-#2D6F9E');
            eingabe.classList.add('buttonBerechnenCss');
            eingabe.classList.add('rounded');
            eingabe.classList.add('shadow');
        }
        box.appendChild(eingabe_label);
        box.appendChild(eingabe);
    } else if (eingabe_art == "ergebnis") {
        let ergebniswert = document.createElement("p");
        //Fügt dem erzeugten p eine Klasse des Bootstrap hinzu, hier padding.
        //text-decoration-underline Ergebniswert wird unterstrichen
        //fs-3 gibt die Schriftgröße vor
        //col erzeugt eine neue Spalte in der Reihe   
        ergebniswert.classList.add('p-3');
        ergebniswert.classList.add('text-decoration-underline');
        ergebniswert.classList.add('fs-3');
        ergebniswert.classList.add('col');
        let ergebnisbeschreibung = document.createElement("p");
        //durch das Hinzufügen der Klasse fs-3 wird die Schriftgröße der Beschreibung angepasst
        ergebnisbeschreibung.classList.add('fs-3');
        //Runden auf 2 Dezimalstellen, €-Zeichen hinzugefügt
        ergebniswert.innerHTML = parseFloat(eingabe_parameter[0]).toFixed(2) + "€";
        ergebnisbeschreibung.innerHTML = eingabe_parameter[1];
        box.appendChild(ergebniswert);
        box.appendChild(ergebnisbeschreibung);
    } else {
        fehler_text = document.createElement("p");
        //Entsprechend eines Fehlers/einer Warnung, wird der Text durch die Klasse text-danger in rot angezeigt
        fehler_text.classList.add('text-danger');
        //durch das Hinzufügen der Klasse fs-3 wird die Schriftgröße der Beschreibung angepasst
        fehler_text.classList.add('fs-3');
        fehler_text.innerHTML = beschreibung;
        box.appendChild(fehler_text);
    }
    map_manager(box_id, box); //Wenn eine Box in der Map existiert, existiert diese auch im DOM
    document.getElementById("abgabenrechner").appendChild(box);

};

/*
Ab einschl. dieser Box ID soll alles entfernt werden. Wenn es in der Map existiert, existiert es auch im DOM, Diese Funktion arbeitet mit der Map Datenstruktur, um das DOM zu verwalten 
*/

function muellsammler(box_id) {
    box_id = parseInt(box_id);
    while (box_id <= dom_inhalt.size) {
        if (dom_inhalt.get(box_id) != undefined) {
            document.getElementById("abgabenrechner").removeChild(dom_inhalt.get(box_id));
            dom_inhalt.delete(box_id);
            dom_inhalt.set(box_id, undefined);
        }
        box_id++;
    }
};

/*
Fügt eine Box mit entsprechender ID der Map hinzu
*/
function map_manager(box_id, box) {
    box_id = parseInt(box_id);
    if (dom_inhalt.size == 0) { //generiere Map mit der benötigten Anzahl von Ebenen, wenn die map leer ist
        for (let i = 1; i <= 5; i++)
            dom_inhalt.set(i, undefined);
    };
    dom_inhalt = dom_inhalt.set(box_id, box); //setze an der Stelle box_id die Box in die Map 






};
