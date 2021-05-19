window.addEventListener("load", init);

function init() {
let xhr_laenderdaten = new XMLHttpRequest();
xhr_laenderdaten.open("GET", "127.0.0.1:5500/json/abgabedaten.json")
xhr_laenderdaten.send();
xhr_laenderdaten.addEventListener("load", function(){laenderdaten_parsen(xhr_laenderdaten);});    
var laenderdaten = function laenderdaten_parsen(xhr_laenderdaten){
    return 
}
};
function laenderoption() { };