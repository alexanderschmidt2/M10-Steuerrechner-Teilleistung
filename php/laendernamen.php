<?php
ob_clean();
header_remove();
header('Content-Type: application/json charset=utf-8');
header('Access-Control-Allow-Origin: *'); //anpassen unsere Seite
$url_laenderdaten = '../json/laenderdaten.json';
$data = file_get_contents($url_laenderdaten);
$laenderdaten = json_decode($data);
$laendernamen = array();
foreach ($laenderdaten->laender as $value) {
    $temp = $value->name;
    array_push($laendernamen, $temp);
}
http_response_code(200);
echo json_encode($laendernamen);
exit();
?>
