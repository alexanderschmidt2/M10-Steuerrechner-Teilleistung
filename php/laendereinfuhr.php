<?php
ob_clean();
header('Access-Control-Allow-Origin: *'); //anpassen unsere Seite 
header('Content-Type: application/json charset=utf-8');
$url_laenderdaten = '../json/laenderdaten.json';
$data = file_get_contents($url_laenderdaten);
$laenderdaten = json_decode($data);
$laendereinfuhr = array();
foreach ($laenderdaten->laender as $value) {
    $temp = $value->name;
    if ($temp == $_GET["land"]){
        array_push($laendereinfuhr, $value->einfuhr, $value -> beschreibung);
        break;
    }
    
}
http_response_code(200);
echo json_encode($laendereinfuhr);
exit();
?>