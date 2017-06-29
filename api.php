<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

define("PATH_TO_MISSIONS", "data/missions/");
header('Content-Type: application/json');

function getMissions() {
    $missions = array();
    $dirInfo = scandir(PATH_TO_MISSIONS);
    foreach ($dirInfo as $dirElem) {
        if (!in_array($dirElem, array('.', '..'))) {
           $missionFile = explode(".", $dirElem);
           if (count($missionFile) == 3 && $missionFile[1] == 'mission' && $missionFile[2] == 'json') {
               $missions[] = $missionFile[0];
           }
        }
    }
    return $missions;
}

$action = $_GET['action'];
if (empty($action)) {
    die;
}

if ($action == 'getMissionsList') {
    $missions = getMissions();
    echo json_encode($missions);
    die;
}

if ($action == 'loadMission') {
    $missionName = $_GET['name'];
    $data = file_get_contents(PATH_TO_MISSIONS . $missionName . ".mission.json");
    echo $data;
    die;
}

if ($action == 'saveMission') {
    $missionId = $_GET['id'];
    $data = $_POST['data'];
    $result = file_put_contents(PATH_TO_MISSIONS . $missionId . ".mission.json", $data);
    echo json_encode(array(
        'success' => $result != false
    ));
    die;
}



