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
    //document.getElementsById("abgaben").addEventListener("change", warenpruefung());
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

    //code vereinheitlichen
    function abgabepruefung(xhr_abgabedaten) {
        let abgabedaten = JSON.parse(xhr_abgabedaten.responseText);
        let land = document.getElementById("land");
        land.addEventListener("change", function () {
            let laenderdaten_ausgewaehlt = JSON.parse(land.value);
            console.log(laenderdaten_ausgewaehlt.einfuhr);
            if (laenderdaten_ausgewaehlt.einfuhr == 0) {
                muellsammler("box_einfuhr_land");
                let einfuhr_box = document.createElement("div");
                let einfuhr_box_p = document.createElement("p");
                einfuhr_box.id = "box_einfuhr_land";
                einfuhr_box.classList.add("einfuhr_verboten");
                einfuhr_box_p.innerHTML = laenderdaten_ausgewaehlt.beschreibung;
                einfuhr_box.appendChild(einfuhr_box_p);
                document.getElementById("abgabenrechner").appendChild(einfuhr_box);
            } else if (laenderdaten_ausgewaehlt.einfuhr == 1) {
                abgabeoptionen(abgabedaten);
            }
        }
        )

    };
    function abgabeoptionen(abgabedaten) {
        if (abgabedaten != null) {
            muellsammler("box_einfuhr_land");
            let box_abgaben = document.createElement("div");
            box_abgaben.id = "box_einfuhr_land";
            box_abgaben.classList.add("einfuhr_erlaubt");
            let array = [document.createElement("label"), document.createElement("select")];
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
            for (let k = 0; k <= abgabedaten.produktart.length; k++) {
                let option_produkte = document.createElement("option");
                option_produkte.value = JSON.stringify(abgabedaten.produktart[k]);
                option_produkte.classList.add("option_produkte");
                option_produkte.innerHTML = abgabedaten.produktart[k].name;
                document.getElementById("abgaben").appendChild(option_produkte);
            }

        }
    }
    //function warenpruefung();
    //muellsammler("box_einfuhr_waren");
    //label, input
};