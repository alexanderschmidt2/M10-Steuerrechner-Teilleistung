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

switch($_GET["auswahl"]){
    case "land":
        foreach ($laenderdaten->laender as $value) {
            $temp = $value->name;
            array_push($response, $temp);
        }
        break;
    case "einfuhr":
        foreach ($laenderdaten->laender as $value) {
            $temp = $value->name;
            if ($temp == $_GET["landwahl"]){
                array_push($response, $value->einfuhr, $value -> beschreibung);
                break;
            }
            
        }
        break;
    case "waren":
        foreach ($warendaten->produktart as $value) {
            $temp = $value->name;
            array_push($response, $temp);
        }
        break;

}

http_response_code(200);
echo json_encode($response);
