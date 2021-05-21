window.addEventListener("load", init);


function init() { //TODO@ Simon Schade, bitte den Code schöner machen und SW fragen
    let xhr_laenderdaten = new XMLHttpRequest();
    xhr_laenderdaten.open("GET", "http://127.0.0.1:5500/json/laenderdaten.json");
    xhr_laenderdaten.send();
    xhr_laenderdaten.addEventListener("load", function () { laenderoption(xhr_laenderdaten); })

    let xhr_abgabedaten = new XMLHttpRequest();
    xhr_abgabedaten.open("GET", "http://127.0.0.1:5500/json/abgabedaten.json");
    xhr_abgabedaten.send();
    xhr_abgabedaten.addEventListener("load", function () { abgabepruefung(xhr_abgabedaten, xhr_laenderdaten) });

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
    function abgabepruefung(xhr_abgabedaten, xhr_laenderdaten) {
        let abgabedaten = JSON.parse(xhr_abgabedaten.responseText);
        let laenderdaten = JSON.parse(xhr_laenderdaten.responseText);
        let land = document.getElementsByClassName("land");
        land.addEventListener("change", function () {
            console.log(land.value);
        })

    };
    function abgabeoptionen(abgabedaten) {

        if (abgabedaten != null) {
            let array = [document.createElement("label"), document.createElement("select")];
            array[0].htmlFor = "abgaben";
            array[0].innerHTML = "Warenart";
            array[1].id = "abgaben";
            for (let i = 0; i <= array.length; i++) {
                console.log(array[i]);
                if (array[i] != undefined) {
                    document.getElementById("abgabenrechner").appendChild(array[i])
                };
            };
            for (let k = 0; k <= abgabedaten.produktart.length; k++) {
                let option_produkte = document.createElement("option");
                option_produkte.classList.add("option_produkte");
                option_produkte.innerHTML = abgabedaten.produktart[k].name;
                document.getElementById("abgaben").appendChild(option_produkte);
            }

        }
    }
};