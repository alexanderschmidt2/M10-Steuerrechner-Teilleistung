<?php 
ob_clean();
header('Access-Control-Allow-Origin: *'); //anpassen unsere Seite 
header('Content-Type: application/json charset=utf-8');
$url_warendaten = '../json/abgabedaten.json';
$data = file_get_contents($url_warendaten);
$warendaten = json_decode($data);
$warennamen = array();
foreach ($warendaten->produktart as $value) {
    $temp = $value->name;
    array_push($warennamen, $temp);
}
http_response_code(200);
echo json_encode($warennamen);
exit();
?>