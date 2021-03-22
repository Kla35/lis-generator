//Load dependencies
var path = "";
var directory_path = ""
var ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('pathfile', function (event,path_received) {
    console.log(path_received);
    path = path_received;
    settings = require(path+'/settings.json');
    console.log(settings);
    registerFont(path+'/font/FjallaOne-Regular.ttf', { family: 'FjallaOne' });
});

ipcRenderer.on('imgpath', function (event,img_path) {
    console.log(img_path);
    directory_path = img_path;
    directorypath_input = document.getElementById("directorypath");
    directorypath_input.value = directory_path+"\\lis_generator\\";
});


var mkdirp = require("mkdirp");
const { createCanvas, loadImage, registerFont } = require('canvas');
const download = require('image-downloader');
const fetch = require('node-fetch');
const fs = require("fs");
const ChartJs = require('node-chartjs-v12');

//Create script variable
var settings = {};
const { exit } = require("process");

var game = null;
var timeline = null;
var tab_runes = [];
var tab_champ = [];
var tab_spell = [];
var version = 0;
var position = 0;
var nbplayer_blueside = 0;
var blueSideId = [];
var redSideId = [];

//Script Variable for Graph
var blueSideId = [];
var redSideId = [];
var arrayBlueGold = [];
var arrayRedGold = [];
var arrayChartGold = [];
var arrayChartColor = [];
var arrayLabel = [];
var arrayDamageBlue = [];
var arrayDamageRed = [];
var gradSave = null;
//Uhhhh... I don't know how to explain. positionXMesurePerkz and positionYMesurePerkz contains where the object start on the picture (from top-left).
//positionXMesurePerkz_Save and positionYMesurePerkz_Save contains the same thing, it's just a save to generate the red team.
//mesureXPerkz and mesureYPerkz contains the size of the object. mesureXPerkz is about the length, and mesureYPerkz about the height
var positionXMesurePerkz = {pseudo : 88, champ : 274, spell1:302, spell2:344,perk1:417, perk2: 542, perk3: 655, perk4: 768,perk5:426,perk6:542, team1: 170, team2:1620, ban :231};
var positionXMesurePerkz_Save = {pseudo : 88, champ : 274, spell1:302, spell2:344,perk1:417, perk2: 542, perk3: 655, perk4: 768,perk5:426,perk6:542, team1: 170, team2:1620, ban :231};
var positionYMesurePerkz = {pseudo : 315, champ : 162, spell1:274, spell2:274,perk1:162, perk2: 168, perk3: 168, perk4: 168,perk5:245,perk6:245, team1: 25, team2:25, ban :986};
var positionYMesurePerkz_Save = {pseudo : 315, champ :162, spell1:274, spell2:274,perk1:162, perk2: 168, perk3: 168, perk4: 168,perk5:245,perk6:245, team1:25, team2: 25, ban :986};
const mesureXPerkz = {pseudo : 0, champ : 105, spell1:35, spell2:35,perk1:79, perk2: 60, perk3: 60, perk4: 60, perk5:60 ,perk6:60, team1: 120, team2: 120, ban :69};
const mesureYPerkz = {pseudo : 0, champ : 105, spell1:35, spell2:35,perk1:79, perk2: 60, perk3: 60, perk4: 60, perk5:60 ,perk6:60, team1: 120, team2: 120, ban :69};

var positionXMesurePostGame = {champ : 59, ban :59, team1:168, team2:664,timer:495,winBlue:253,winRed:757,towerBlue:321,towerRed:685,baronBlue:321,baronRed:685,drakeBlueCenter:298,drakeRedCenter:661,kdaBlue:1253,kdaRed:1721,total_goldBlue:1253,total_GoldRed:1721,visionScoreBlue:1253,visionScoreRed:1721,champDamageBlue:1146,champDamageRed:1763,damageBlue:1201,damageRed:1757};
var positionXMesurePostGame_Save = {champ : 59, ban :59, team1:168, team2:664,timer:495,winBlue:253,winRed:757,towerBlue:321,towerRed:685,baronBlue:321,baronRed:685,drakeBlueCenter:298,drakeRedCenter:661,kdaBlue:1253,kdaRed:1721,total_goldBlue:1253,total_GoldRed:1721,visionScoreBlue:1253,visionScoreRed:1721,champDamageBlue:1146,champDamageRed:1763,damageBlue:1201,damageRed:1757};
var positionYMesurePostGame = {champ : 575, ban :759, team1:181, team2:181,timer:450,winBlue:442,winRed:442,towerBlue:942,towerRed:942,baronBlue:1054,baronRed:1054,drakeBlueCenter:942,drakeRedCenter:942,kdaBlue:169,kdaRed:169,total_goldBlue:230,total_GoldRed:230,visionScoreBlue:291,visionScoreRed:291,champDamageBlue:407,champDamageRed:407,damageBlue:459,damageRed:459};
var positionYMesurePostGame_Save = {champ : 575, ban :759, team1:181, team2:181,timer:450,winBlue:442,winRed:442,towerBlue:942,towerRed:942,baronBlue:1044,baronRed:1044,drakeBlueCenter:942,drakeRedCenter:942,kdaBlue:169,kdaRed:169,total_goldBlue:230,total_GoldRed:230,visionScoreBlue:291,visionScoreRed:291,champDamageBlue:407,champDamageRed:407,damageBlue:459,damageRed:459};
const mesureXPostGame = {champ : 72, ban :72, team1:180, team2:180, drake:46,champDamageBlue:51,champDamageRed:51};
const mesureYPostGame = {champ : 72, ban :72, team1:180, team2:180, drake:46,champDamageBlue:51,champDamageRed:51};

console.log(settings); 

function defaultSettings(){
    if (settings.team1Name == ""){
        settings.team1Name = "Blue Side";
    }
    if (settings.team2Name == ""){
        settings.team2Name = "Red Side";
    }
    if (settings.server == ""){
        settings.server = "euw1";
    }
}

