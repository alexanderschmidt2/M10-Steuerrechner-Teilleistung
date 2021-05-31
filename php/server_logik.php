<?php
ob_clean();
header_remove();
header('Content-Type: application/json charset=utf-8');
header('Access-Control-Allow-Origin: *'); //anpassen unsere Seite

$url_laenderdaten = '../json/laenderdaten.json';
$data_laender = file_get_contents($url_laenderdaten);
$laenderdaten = json_decode($data_laender);

$url_warendaten = '../json/abgabedaten.json';
$data_waren = file_get_contents($url_warendaten);
$warendaten = json_decode($data_waren);

$response = array();


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
    case "einfuhr_verbot";
        foreach ($warendaten->produktart as $value) {
            if ($value->name == $_GET["warenwahl"]) {
                if ($value->einfuhr_verbot[0] == "1") {
                    array_push($response, $value->einfuhr_verbot[0], $value->beschreibung . " die Einfuhr dieser Ware ist verboten");
                    break;
                } elseif ($value->einfuhr_verbot[0] == "0") {
                    array_push($response, $value->einfuhr_verbot[0], $value->beschreibung . " die Einfuhr dieser Ware ist elaubt");
                    break;
                } else {
                    for ($i = 0; $i <= count($value->einfuhr_verbot); $i++) {
                        if ($value->einfuhr_verbot[$i] == $_GET["landwahl"]) {
                            array_push($response, "1", $value->beschreibung . " die Einfuhr ist somit aus " . $_GET["landwahl"] . " nicht erlaubt");
                            break;
                        }
                    }
                    array_push($response, "0", $value->beschreibung . " die Einfuhr ist elaubt");
                    break;
                }
            }
        }
        break;
    case "rechner";
        $land = getLand($_GET["landwahl"], $laenderdaten);
        $ware = getWare($_GET["warenwahl"], $warendaten);
        $warenwert = floatval($_GET["warenwert"]);
        $beschreibung;
        if ($land->eu_mitgliedschaft == "1") { //Bei EU Mitgliedschaft fällt nur eine eventuelle Verbrauchssteuer an. Handel ansonsten frei.
            $beschreibung = "Das Land " . $land->name . " ist ein EU Mitgliedstaat, deswegen faellt weder Zoll, noch eine Einfuhrumsatzsteuer an ";
            if ($ware->verbrauchssteuer != 0) {
                $beschreibung = $beschreibung . " auf diese Ware faellt doch die Verbrauchssteuer an.";
                $abgaben = $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } else {
                $beschreibung = $beschreibung . " eine Verbrauchssteuer fällt ebenfalls nicht an.";
                array_push($response, "0", $beschreibung);
                break;
            }
        } else {
            $beschreibung = "Das Land " . $land->name . " ist kein EU Mitgliedstaat, deswegen fallen gegebenenfalls Zoll und die Einfuhrumsatzsteuer an";
            if ($warenwert < 22) {
                $beschreibung = $beschreibung . " der Warenwert ist unter 22 Euro. Zoll und die Einfuhrumsatzsteuer fallen dementsprechend nicht an";
                array_push($response, "0", $beschreibung);
                break;
            } elseif ($warenwert < 22 && $ware->verbrauchssteuer != 0.0) {
                $beschreibung = $beschreibung . " der Warenwert ist unter 22 Euro. Zoll und die Einfuhrumsatzsteuer fallen dementsprechend nicht an. Jedoch ist die Verbrauchssteuer faellig.";
                $abgaben = $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } elseif ($warenwert > 22 && $warenwert < 150) {
                $beschreibung = $beschreibung . " der Warenwert ist größer als 22 Euro, daher fällt also die Einfuhrumsatzsteuer an. Der Zollfreibetrag wurde jedoch nicht überschritten. ";
                $abgaben = $warenwert * $ware->einfuhrumsatzsteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } elseif ($warenwert > 22 && $warenwert < 150 && $ware->verbrauchssteuer != 0) {
                $beschreibung = $beschreibung . " der Warenwert ist größer als 22 Euro, daher fällt also die Einfuhrumsatzsteuer an. Außerdem ist die Verbrauchssteuer faellig. Der Zollfreibetrag wurde jedoch nicht überschritten. ";
                $abgaben = $warenwert * $ware->einfuhrumsatzsteuer + $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } elseif ($warenwert > 150 && $ware->verbrauchssteuer != 0.0) {
                $beschreibung = $beschreibung . " es fallen sowohl Einfuhrumsatzsteuer und der Zollsatz an. Da es sich außerdem bei " . $ware->name . " um ein Verbrauchsgut handelt, faellt auch Verbrauchsteuer an"; //TODO: Simon Werte konkartinieren
                $abgaben = $warenwert * $ware->zollsatz + $warenwert * $ware->einfuhrumsatzsteuer + $warenwert * $ware->verbrauchssteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            } else {
                $beschreibung = $beschreibung . " es fallen sowohl der Zollsatz, als auch die Einfuhrumsatzsteuer an";
                $abgaben = $warenwert * $ware->zollsatz + $warenwert * $ware->einfuhrumsatzsteuer;
                array_push($response, $abgaben, $beschreibung);
                break;
            }
        };
        break;
}

http_response_code(200);
echo json_encode($response);
