window.addEventListener("load", init);


function init() { //TODO@ Simon Schade, bitte den Code schöner machen und SW fragen
    let xhr_laenderdaten = new XMLHttpRequest();
    xhr_laenderdaten.open("GET", "http://127.0.0.1:5500/json/laenderdaten.json");
    xhr_laenderdaten.send();
    xhr_laenderdaten.addEventListener("load", function () { laenderoption(xhr_laenderdaten); })

    let xhr_abgabedaten = new XMLHttpRequest();
    xhr_abgabedaten.open("GET", "http://127.0.0.1:5500/json/abgabedaten.json");
    xhr_abgabedaten.send();
    xhr_abgabedaten.addEventListener("load", function () { abgabepruefung(xhr_abgabedaten) });

    function laenderoption(xhr_laenderdaten) {
        let laenderdaten = JSON.parse(xhr_laenderdaten.responseText);
        if (laenderdaten != null) {
            for (let i = 0; i <= laenderdaten.laender.length; i++) {
                let option_laender = document.createElement("option");
                option_laender.classList.add("option_laender");
                option_laender.value = JSON.stringify(laenderdaten.laender[i]);
                option_laender.innerHTML = laenderdaten.laender[i].name;
                document.getElementById("land").appendChild(option_laender);
            }

        }
    };


    function muellsammler(id) {//TODO: Schmittwilken fragen, wie wir das selektieren müssen
        if (document.getElementById(id) != null) {
            document.getElementById(id).remove();
        }
    };
    //code vereinheitlichen UND TODO: Verbotsboxerstellungsfunktion! 
    function abgabepruefung(xhr_abgabedaten) {
        let abgabedaten = JSON.parse(xhr_abgabedaten.responseText);
        let land = document.getElementById("land");
        land.addEventListener("change", function () {
            muellsammler("box_einfuhr_land");
            let laenderdaten_ausgewaehlt = JSON.parse(land.value);
            console.log(laenderdaten_ausgewaehlt.einfuhr);
            if (laenderdaten_ausgewaehlt.einfuhr == 0) {
                let einfuhr_box = document.createElement("div");
                let einfuhr_box_p = document.createElement("p");
                einfuhr_box.id = "box_einfuhr_land";
                einfuhr_box.classList.add("einfuhr_verboten");
                einfuhr_box_p.innerHTML = laenderdaten_ausgewaehlt.beschreibung;
                einfuhr_box.appendChild(einfuhr_box_p);
                document.getElementById("abgabenrechner").appendChild(einfuhr_box);
            } else if (laenderdaten_ausgewaehlt.einfuhr == 1) {//append in a div funktion???
                let box_abgaben = document.createElement("div");
                box_abgaben.id = "box_einfuhr_land"; //Nomenklatur ändern
                box_abgaben.classList.add("einfuhr_erlaubt");
                let array = [document.createElement("label"), document.createElement("select")]; // ggf. auch in eine Funktion auslagern!!!
                array[0].htmlFor = "abgaben";
                array[0].innerHTML = "Warenart";
                array[1].id = "abgaben";
                for (let i = 0; i < array.length; i++) {
                    console.log(array[i]);
                    if (array[i] != undefined) {
                        box_abgaben.appendChild(array[i])
                    };
                    document.getElementById("abgabenrechner").appendChild(box_abgaben);
                };
                document.getElementById("abgaben").addEventListener("change", produktpruefung);
                for (let k = 0; k <= abgabedaten.produktart.length; k++) {
                    let option_produkte = document.createElement("option");
                    option_produkte.value = JSON.stringify(abgabedaten.produktart[k]);
                    option_produkte.classList.add("option_produkte");
                    option_produkte.innerHTML = abgabedaten.produktart[k].name;
                    document.getElementById("abgaben").appendChild(option_produkte);

                };
            }
        }
        )
    };
    function produktpruefung() {
        muellsammler("box_einfuhr_produkte");
        let produkt_ausgewaehlt = JSON.parse(document.getElementById("abgaben").value);
        console.log(produkt_ausgewaehlt);
        if (produkt_ausgewaehlt.einfuhr_verbot[0].localeCompare("1") == 0) {
            let einfuhr_box = document.createElement("div");
            let einfuhr_box_p = document.createElement("p");
            einfuhr_box.id = "box_einfuhr_produkte";
            einfuhr_box.classList.add("einfuhr_verboten");
            einfuhr_box_p.innerHTML = produkt_ausgewaehlt.beschreibung;
            einfuhr_box.appendChild(einfuhr_box_p);
            document.getElementById("abgabenrechner").appendChild(einfuhr_box);
        }
        else if (produkt_ausgewaehlt.einfuhr_verbot[0].localeCompare("0") == 0) {
            let einfuhr_box = document.createElement("div");
            einfuhr_box.id = "box_einfuhr_produkte";
            einfuhr_box.classList.add("einfuhr_erlaubt");
            let array = [document.createElement("label"), document.createElement("input"), document.createElement("button")]
            array[0].htmlFor = "warenwert";
            array[0].innerHTML = "Warenwert angeben in €";
            array[1].id = "warenwert";
            array[1].setAttribute("type", "number");
            array[2].innerHTML = "berechnen";
            array[2].id = "button";
            for (let i = 0; i < array.length; i++) {
                console.log(array[i]);
                if (array[i] != undefined) {
                    einfuhr_box.appendChild(array[i])
                };

            };
            document.getElementById("abgabenrechner").appendChild(einfuhr_box);
            document.getElementById("button").addEventListener("click", function () { rechner(produkt_ausgewaehlt, document.getElementById("warenwert").value) });
        }
        else{
            if(produkt_ausgewaehlt.einfuhr_verbot.includes(JSON.parse(document.getElementById("land").value).name)){
                let einfuhr_box = document.createElement("div");
                let einfuhr_box_p = document.createElement("p"); //TODO: defintiv als Funktion
                einfuhr_box.id = "box_einfuhr_produkte";
                einfuhr_box.classList.add("einfuhr_verboten");
                einfuhr_box_p.innerHTML = "einfuhr aus diesem land verboten";
                einfuhr_box.appendChild(einfuhr_box_p);
                document.getElementById("abgabenrechner").appendChild(einfuhr_box);    
            }
            else{
                rechner(produkt_ausgewaehlt, warenwert);
            }
        }
    }
    function rechner(produkt_ausgewaehlt, warenwert) {
        müllsammler("box_einfuhr_produkte");
        let gesamtabgaben = produkt_ausgewaehlt.zollsatz * warenwert + produkt_ausgewaehlt.einfuhrumsatzsteuer * warenwert + produkt_ausgewaehlt.verbrauchssteuer*warenwert;
        let absatz = document.createElement("p");
        absatz.innerHTML = gesamtabgaben
        document.getElementById("form").appendChild(absatz);

    };
};
