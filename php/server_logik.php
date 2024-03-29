<?php
ob_clean();
header_remove();
header('Content-Type: application/json charset=utf-8');
header('Access-Control-Allow-Origin: *'); 

//Die JSON "Datenbanken" werdenn inital in eine PHP Variable geladen. Die Daten müssten in einem "cache" Zwischengespeichert werden, Clientunabhängig. Leider gibt uns die Serverinstallation das nicht her, 
//deswegen gibt es eine Alternative Lösung. 

$url_laenderdaten = '../json/laenderdaten.json'; 
$data_laender = file_get_contents($url_laenderdaten);
$laenderdaten = json_decode($data_laender);

$url_warendaten = '../json/abgabedaten.json';
$data_waren = file_get_contents($url_warendaten);
$warendaten = json_decode($data_waren);

$response = array(); //hier wird der Response Array inittiert


function getLand($name, $laenderdaten)
{
    foreach ($laenderdaten->laender as $value) {
        if ($value->name == $name) {
            return $value;
        }
    }
};
function getWare($name, $warendaten)
{
    foreach ($warendaten->produktart as $value) {
        if ($value->name == $name) {
            return $value;
        }
    }
};
//Je nach GET Parameter wird eine Reihe von Anweisungen ausgeführt.
//Daten werden Clientseitig ggf. in beliebiger Reihenfolge gesendet, da sich der User z.B. beim Land nicht entscheiden kann. Ein Zwischenspeichern in der Session Variable und dei Überprüfung, ob sich 
//etwas verändert hat wäre somit verschwendeter Code. Der PHP Code muss immer die Aktualität und Dynamik des Clients beibehalten. Eine Abfrage nach Aktualität der Informationen ist nicht Zielführend   
switch ($_GET["auswahl"]) {
    case "land":
        foreach ($laenderdaten->laender as $value) {
            array_push($response, $value->name);
        }
        break;
    case "einfuhr":
        $land = getLand($_GET["landwahl"], $laenderdaten);
        array_push($response, $land->einfuhr, $land->beschreibung);
        break;
    case "waren":
        foreach ($warendaten->produktart as $value) {
            array_push($response, $value->name);
        }
        break;
    case "einfuhr_verbot"; //Prüfen ob eine Einfuhr aus dem gewählten Land erlaubt ist
        foreach ($warendaten->produktart as $value) {
            if ($value->name == $_GET["warenwahl"]) {
                if ($value->einfuhr_verbot[0] == "1") {
                    array_push($response, $value->einfuhr_verbot[0], $value->beschreibung . ". Die Einfuhr ist somit verboten.");
                    break;
                } elseif ($value->einfuhr_verbot[0] == "0") {
                    array_push($response, $value->einfuhr_verbot[0], $value->beschreibung . ". Die Einfuhr dieser Ware ist elaubt.");
                    break;
                } else {
                    for ($i = 0; $i <= count($value->einfuhr_verbot); $i++) {
                        if ($value->einfuhr_verbot[$i] == $_GET["landwahl"]) {
                            array_push($response, "1", $value->beschreibung . " Die Einfuhr ist somit aus " . $_GET["landwahl"] . " nicht erlaubt.");
                            break;
                        }
                    }
                    array_push($response, "0", $value->beschreibung . " die Einfuhr ist elaubt");
                    break;
                }
            }
        }
        break;

//Berechnung der anfallenden Steuern. 
//Abfrage 1: Handelt es sich um ein EU Land? Falls ja, fällt gegebenenfalls nur die Verbrauchssteuer an. Der Handel in der EU ist für den Privatgebrauch sonst frei.
    case "rechner";
        $land = getLand($_GET["landwahl"], $laenderdaten);
        $ware = getWare($_GET["warenwahl"], $warendaten);
        $warenwert = floatval($_GET["warenwert"]);
        $beschreibung;
        if ($land->eu_mitgliedschaft == "1") { 
            $beschreibung = "Das Land " . $land->name . " ist ein EU Mitgliedstaat, deswegen faellt weder Zoll, noch eine Einfuhrumsatzsteuer an. ";
            if ($ware->verbrauchssteuer != 0) {
                $beschreibung = $beschreibung . "Auf diese Ware faellt jedoch die Verbrauchssteuer an.";
                $abgaben = $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } else {
                $beschreibung = $beschreibung . "Eine Verbrauchssteuer fällt ebenfalls nicht an.";
                array_push($response, "0", $beschreibung);
                break;
            }
//Anschließende Berechnungen für die Einfuhr aus nicht EU Ländern.
//Erste Prüfung ob der Warenwert unter 22 Euro ist und ob eine Verbrauchssteuer anfällt.
//Anschließende Prüfung ob die Einfuhrumsatzsteuer/Verbrauchssteuer anfällt. Dies ist bei einem Warenwert zwischen 22 und 150 der Fall.
//Sofern der Warenwert 150 Euro überschreitet, wird der Zoll, die Einfuhrumsatzsteuer und ggfs. die Verbrauchssteuer fällig.
//Prüfung ob die Verbrauchssteuer !=0 muss zuerst geprüft werden, damit dies auf jeden Fall immer geprüft wird.

        } else {
            $beschreibung = "Das Land " . $land->name . " ist kein EU Mitgliedstaat, deswegen fallen gegebenenfalls Zoll und die Einfuhrumsatzsteuer an. ";
            if ($warenwert < 22 && $ware->verbrauchssteuer != 0.0) {
                $beschreibung = $beschreibung . "Der Warenwert ist unter 22 Euro. Zoll und die Einfuhrumsatzsteuer fallen dementsprechend nicht an. Jedoch ist für ". $ware->name . " die Verbrauchssteuer faellig.";
                $abgaben = $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } 
            elseif ($warenwert < 22) {
                $beschreibung = $beschreibung . "Der Warenwert ist unter 22 Euro. Zoll und die Einfuhrumsatzsteuer fallen dementsprechend nicht an";
                array_push($response, "0", $beschreibung);
                break;
            }
            elseif ($warenwert > 22 && $warenwert <= 150 && $ware->verbrauchssteuer != 0.0) {
                $beschreibung = $beschreibung . "Der Warenwert ist größer als 22 Euro, daher fällt also die Einfuhrumsatzsteuer an. Außerdem ist für " . $ware->name . " die Verbrauchssteuer faellig. Der Zollfreibetrag wurde jedoch nicht überschritten. ";
                $abgaben = $warenwert * $ware->einfuhrumsatzsteuer + $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            
            } 
            elseif ($warenwert > 22 && $warenwert < 150) {
                $beschreibung = $beschreibung . "Der Warenwert ist größer als 22 Euro, daher fällt also die Einfuhrumsatzsteuer an. Der Zollfreibetrag wurde jedoch nicht überschritten. ";
                $abgaben = $warenwert * $ware->einfuhrumsatzsteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            }  
            elseif ($warenwert > 150 && $ware->verbrauchssteuer != 0.0) {
                $beschreibung = $beschreibung . "Es fallen sowohl Einfuhrumsatzsteuer und der Zollsatz an. Da es sich außerdem bei " . $ware->name . " um ein Verbrauchsgut handelt, faellt auch Verbrauchsteuer an."; //TODO: Simon Werte konkartinieren
                $abgaben = $warenwert * $ware->zollsatz + $warenwert * $ware->einfuhrumsatzsteuer + $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } 
            else {
                $beschreibung = $beschreibung . "Beim eingegebenen Warenwert fallen sowohl der Zollsatz, als auch die Einfuhrumsatzsteuer an.";
                $abgaben = $warenwert * $ware->zollsatz + $warenwert * $ware->einfuhrumsatzsteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            }
        };
        break;
}

http_response_code(200); //Wenn alles in Ordnung war wird dieser Response Code hingeschickt. Sollte es probleme gegeben haben wird automatisch ein anderer Response code wie "500" zurückgeschickt
echo json_encode($response);
