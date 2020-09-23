//Load dependencies
var mkdirp = require("mkdirp");
const cliProgress = require('cli-progress');
const { createCanvas, loadImage } = require('canvas');
const download = require('image-downloader');
const fetch = require('node-fetch');
const fs = require("fs");

//Create script variable
const settings = require('./settings.json');
defaultSettings();
var game = null;
var tab_runes = [];
var tab_champ = [];
var tab_spell = [];
var version = 0;
var position = 0;
var nbplayer_blueside = 0;
console.log(settings);

//Uhhhh... I don't know how to explain. positionXMesure and positionYMesure contains where the object start on the picture (from top-left).
//positionXMesure_Save and positionYMesure_Save contains the same thing, it's just a save to generate the red team.
//mesureX and mesureY contains the size of the object. mesureX is about the length, and mesureY about the height
var positionXMesure = {pseudo : 88, champ : 274, spell1:302, spell2:344,perk1:417, perk2: 542, perk3: 655, perk4: 768,perk5:426,perk6:542, team1: 160, team2:1620};
var positionXMesure_Save = {pseudo : 88, champ : 274, spell1:302, spell2:344,perk1:417, perk2: 542, perk3: 655, perk4: 768,perk5:426,perk6:542, team1: 160, team2:1620};
var positionYMesure = {pseudo : 315, champ : 162, spell1:274, spell2:274,perk1:162, perk2: 168, perk3: 168, perk4: 168,perk5:245,perk6:245, team1: 12, team2:12};
var positionYMesure_Save = {pseudo : 315, champ :162, spell1:274, spell2:274,perk1:162, perk2: 168, perk3: 168, perk4: 168,perk5:245,perk6:245, team1:12, team2: 12};
const mesureX = {pseudo : 0, champ : 105, spell1:35, spell2:35,perk1:79, perk2: 60, perk3: 60, perk4: 60, perk5:60 ,perk6:60, team1: 150, team2: 150};
const mesureY = {pseudo : 0, champ : 105, spell1:35, spell2:35,perk1:79, perk2: 60, perk3: 60, perk4: 60, perk5:60 ,perk6:60, team1: 150, team2: 150};

(async () => {
    //Retrieve summoner
    const playerAPI = await fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/"+settings.accountName+"?api_key="+settings.APIKey);
    const jsonPlayer = await playerAPI.json();
    const SummonerId = jsonPlayer["id"];

    //Retrieve game
    const gameAPI = await fetch("https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/"+SummonerId+"?api_key="+settings.APIKey);
    game = await gameAPI.json();

    if(game.gameId == undefined){
        await console.log("This player is not in game !")
        return;
    } else {
        game.participants.forEach(p => {
            if(p.teamId == 100){
                nbplayer_blueside++;
            }
        });
        console.log(nbplayer_blueside);
        // 
    }

    //Retrieve actual version
	const requestVersion = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const jsonVersion = await requestVersion.json();
    
    version = jsonVersion[0];

    //Create folder (if new version)
    var returnFolder = await mkdirp('data/'+version+'/en_US/', { recursive: true });
    console.log(returnFolder);
    //If new version, download perks json and perks images
    if ( typeof returnFolder !== 'undefined'){
        var jsonPerks = await downloadJSONperks();
        var jsonChamp = await downloadJSONchamp();
        var jsonSpell = await downloadJSONspell();
        createPerksJSON(jsonPerks);
        createChampJSON(jsonChamp);
        createSpellJSON(jsonSpell);
        console.log("Starting download of Perks...");
        const b1 = new cliProgress.SingleBar({
            format: 'Progress |' + '{bar}' + '| {percentage}% || {value}/{total} pictures',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        b1.start(tab_runes.length, 0, {
            speed: "N/A"
        });

        for(let a=0; a < tab_runes.length; a++){
            await downloadPerk(tab_runes[a]);
            await b1.increment();
        }
        b1.stop();
        console.log("Downloaded Perks !");

        console.log("Starting download of champions...");
        const b2 = new cliProgress.SingleBar({
            format: 'Progress |' + '{bar}' + '| {percentage}% || {value}/{total} pictures',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        b2.start(tab_champ.length, 0, {
            speed: "N/A"
        });
        
        for(let b=0; b < tab_champ.length; b++){
            await downloadChamp(tab_champ[b]);
            await b2.increment();
        }
        b2.stop();
        console.log("Downloaded champions !");

        console.log("Starting download of Spell...");
        const b3 = new cliProgress.SingleBar({
            format: 'Progress |' + '{bar}' + '| {percentage}% || {value}/{total} pictures',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        b3.start(tab_spell.length, 0, {
            speed: "N/A"
        });
        for(let c=0; c < tab_spell.length; c++){
            await downloadSpell(tab_spell[c]);
            b3.increment();
        }
        b3.stop();
        console.log("Downloaded Spell !");
        
    } else {
        //Else, just load perks
        var jsonPerks = require('./data/'+version+"/en_US/runesReforged.json");
        var jsonChamp = require('./data/'+version+"/en_US/champion.json");
        var jsonSpell = require('./data/'+version+"/en_US/summoner.json");
        createPerksJSON(jsonPerks);
        createChampJSON(jsonChamp);
        createSpellJSON(jsonSpell);
    }

    //Convert id runes to object perk
    game.participants.forEach(summoner => {
        list_perks = summoner.perks.perkIds;
        summoner.perks.perkIds = translatePerkz(list_perks);
        summoner.champImg = translateChamp(summoner.championId);
        summoner.spell1Img = translateSpell(summoner.spell1Id);
        summoner.spell2Img = translateSpell(summoner.spell2Id);
        //console.log(summoner);
        //console.log(summoner.perks);
    });

    //Generate Image
    console.log("Starting generate picture...");
    generateImage();
    console.log("Picture generate !");
})();

//Translate perk id to perk object
function translatePerkz(list_perks){
    translate_perks = [];
    list_perks.forEach(perk => {
        const index = tab_runes.findIndex(perks => perks.id == perk);
        if(index != -1){
            translate_perks.push(tab_runes[index]);
        }
    })
    return translate_perks;
}

//Translate champ id to champ image path
function translateChamp(id_champ){
    const index = tab_champ.findIndex(champ => champ.id == id_champ);
    let img = '';
    if (index != -1){
        img = tab_champ[index].img;
    }
    return img;
}

//Translate spell id to spell image path
function translateSpell(id_spell){
    const index = tab_spell.findIndex(spell => spell.id == id_spell);
    let img = '';
    if (index != -1){
        img = tab_spell[index].img;
    }
    return img;
}

//Download perk image from DDragon
async function downloadPerk(item){
    const options = {
      url: 'http://ddragon.leagueoflegends.com/cdn/img/'+item.icon,
      dest: './data/'+version+"/en_US/"+item.icon
    }

    await verifyFSPerk(item.icon);
    
    await download.image(options).catch((err) => console.error(err))
}

//Download champion image from DDragon
async function downloadChamp(item){
    const options = {
      url: 'http://ddragon.leagueoflegends.com/cdn/'+version+'/img/champion/'+item.img,
      dest: './data/'+version+"/en_US/champion/"+item.img
    }

    await verifyFSChamp();
    
    await download.image(options).catch((err) => console.error(err))
}

//Download spell image from DDragon
async function downloadSpell(item){
    const options = {
      url: 'http://ddragon.leagueoflegends.com/cdn/'+version+'/img/spell/'+item.img,
      dest: './data/'+version+"/en_US/spell/"+item.img
    }

    await verifyFSSpell();
    
    await download.image(options).catch((err) => console.error(err))
}

//Download and store perk json from DDragon
async function downloadJSONperks(){
    const requestPerks = await fetch('http://ddragon.leagueoflegends.com/cdn/'+ version +'/data/en_US/runesReforged.json');
    const jsonChamp = await requestPerks.json();
    await fs.writeFile('./data/'+version+"/en_US/runesReforged.json", JSON.stringify(jsonChamp), function (err) {
            if (err) return console.log(err);
    });
    return jsonChamp;
}

//Download and store champion json from DDragon
async function downloadJSONchamp(){
    const requestPerks = await fetch('http://ddragon.leagueoflegends.com/cdn/'+ version +'/data/en_US/champion.json');
    const jsonPerks = await requestPerks.json();
    await fs.writeFile('./data/'+version+"/en_US/champion.json", JSON.stringify(jsonPerks), function (err) {
            if (err) return console.log(err);
    });
    return jsonPerks;
}

//Download and store spell json from DDragon
async function downloadJSONspell(){
    const requestPerks = await fetch('http://ddragon.leagueoflegends.com/cdn/'+ version +'/data/en_US/summoner.json');
    const jsonSpell = await requestPerks.json();
    await fs.writeFile('./data/'+version+"/en_US/summoner.json", JSON.stringify(jsonSpell), function (err) {
            if (err) return console.log(err);
    });
    return jsonSpell;
}

//Create a smaller tab for perks
function createPerksJSON(jsonPerks){
    jsonPerks.forEach(item => {
        tab_runes.push({id : item.id, name : item.name, icon : item.icon})
        item.slots.forEach(subitem =>{
            subitem.runes.forEach(runesitem =>{
                tab_runes.push({id : runesitem.id, name : runesitem.name, icon : runesitem.icon})
            });
        })
    })
}

//Create a smaller tab for champions
function createChampJSON(jsonChamp){
    jsonChamp = jsonChamp["data"];
    Object.keys(jsonChamp).forEach(function(key) {
        let item = jsonChamp[key];
        let jsonItem = {id: item.key, img : item.image.full}
        tab_champ.push(jsonItem);
    });
}

//Create a smaller tab for spell
function createSpellJSON(jsonSpell){
    jsonSpell = jsonSpell["data"];
    Object.keys(jsonSpell).forEach(function(key) {
        let item = jsonSpell[key];
        let jsonItem = {id: item.key, img : item.image.full}
        tab_spell.push(jsonItem);
    });
}

//Verify if folder exist for Perk : If not, create it
async function verifyFSPerk(dest){
    let tab = dest.split("/");
    let str_dest = "";
    for(i=0;i<tab.length-1;i++){
        str_dest = str_dest + tab[i] + "/";
    }
    var returnFolder = await mkdirp('data/'+version+'/en_US/'+str_dest, { recursive: true });
}

//Verify if folder exist for Champ : If not, create it
async function verifyFSChamp(){
    await mkdirp('data/'+version+'/en_US/champion/', { recursive: true });
}

//Verify if folder exist for Spell : If not, create it
async function verifyFSSpell(){
    await mkdirp('data/'+version+'/en_US/spell/', { recursive: true });
}

//Generate image from data
function generateImage(){
    const width = 1920
    const height = 1080

    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')
   
    //Base
    loadImage('./concept/baseline.png').then(async image => {
        context.drawImage(image, 0, 0, 1920, 1080);

        context.font = 'bold 40pt Serif'
        context.textBaseline = 'bottom'
        context.textAlign = 'center';
        context.fillStyle = '#ffffff'
        await context.fillText(settings.team1Name, 574, 115);
        await context.fillText(settings.team2Name, 1350, 115);
        context.textAlign = 'left';
        context.font = 'bold 20pt Arial'

        if(settings.logoTeam1 != ""){
            await loadImage('./logo/'+settings.logoTeam1).then(async image => {
                await context.drawImage(image, positionXMesure.team1, positionYMesure.team1, mesureX.team1, mesureY.team1);
            });
        } else {
            await loadImage('./logo/defaultBlue.png').then(async image => {
                await context.drawImage(image, positionXMesure.team1, positionYMesure.team1, mesureX.team1, mesureY.team1);
            });
        }

        if(settings.logoTeam2 != ""){
            await loadImage('./logo/'+settings.logoTeam1).then(async image => {
                await context.drawImage(image, positionXMesure.team2, positionYMesure.team2, mesureX.team2, mesureY.team2);
            });
        } else {
            await loadImage('./logo/defaultRed.png').then(async image => {
                await context.drawImage(image, positionXMesure.team2, positionYMesure.team2, mesureX.team2, mesureY.team2);
            });
        }

        //Loop to generate picture for each player
        for(let g=0;g<game.participants.length;g++){
            summoner = game.participants[g];
            if (position>nbplayer_blueside-1){
                context.textAlign = 'right';
            }
            //Username
            if(summoner.summonerName.length > 12){
                context.font = 'bold 15pt Arial';
            }

            if(summoner.summonerName.length > 20){
                summoner.summonerName = summoner.summonerName.substring(0,18) + "..."
            }
            await context.fillText(summoner.summonerName, positionXMesure.pseudo, positionYMesure.pseudo);

            if(summoner.summonerName.length > 12){
                context.font = 'bold 20pt Arial';
            }
            //Champ Square
            await loadImage('./data/'+version+'/en_US/champion/'+summoner.champImg).then(async image => {
                await context.drawImage(image, positionXMesure.champ, positionYMesure.champ, mesureX.champ, mesureY.champ);
            });

            //Spell 1
            await loadImage('./data/'+version+'/en_US/spell/'+summoner.spell1Img).then(async image => {
                await context.drawImage(image, positionXMesure.spell1, positionYMesure.spell1, mesureX.spell1, mesureY.spell1);
            });

            //Spell 2
            await loadImage('./data/'+version+'/en_US/spell/'+summoner.spell2Img).then(async image => {
                await context.drawImage(image, positionXMesure.spell2, positionYMesure.spell2, mesureX.spell2, mesureY.spell2);
            });
            
            //Perk 1
            await loadImage('./data/'+version+'/en_US/'+summoner.perks.perkIds[0].icon).then(async image => {
                await context.drawImage(image, positionXMesure.perk1, positionYMesure.perk1, mesureX.perk1, mesureY.perk1);
            });

            //Perk 2
            await loadImage('./data/'+version+'/en_US/'+summoner.perks.perkIds[1].icon).then(async image => {
                await context.drawImage(image, positionXMesure.perk2, positionYMesure.perk2, mesureX.perk2, mesureY.perk2);
            });

            //Perk 3
            await loadImage('./data/'+version+'/en_US/'+summoner.perks.perkIds[2].icon).then(async image => {
                await context.drawImage(image, positionXMesure.perk3, positionYMesure.perk3, mesureX.perk3, mesureY.perk3);
            });

            //Perk 4
            await loadImage('./data/'+version+'/en_US/'+summoner.perks.perkIds[3].icon).then(async image => {
                await context.drawImage(image, positionXMesure.perk4, positionYMesure.perk4, mesureX.perk4, mesureY.perk4);
            });

            //Perk 5
            await loadImage('./data/'+version+'/en_US/'+summoner.perks.perkIds[4].icon).then(async image => {
                await context.drawImage(image, positionXMesure.perk5, positionYMesure.perk5, mesureX.perk5, mesureY.perk5);
            });

            //Perk 6
            await loadImage('./data/'+version+'/en_US/'+summoner.perks.perkIds[5].icon).then(async image => {
                await context.drawImage(image, positionXMesure.perk6, positionYMesure.perk6, mesureX.perk6, mesureY.perk6);
                await updatePosition();
            });
        }
        const buffer = canvas.toBuffer('image/png')
        fs.writeFileSync('./picture.png', buffer)
    });
}

//Weird function. It update where object picture have to start (from top-left), depends on the nomber of player
function updatePosition(){
    position++;
    if (position < nbplayer_blueside){
        positionYMesure.pseudo = positionYMesure.pseudo + 162;
        positionYMesure.champ = positionYMesure.champ + 162;
        positionYMesure.spell1 = positionYMesure.spell1 + 162;
        positionYMesure.spell2 = positionYMesure.spell2 + 162;
        positionYMesure.perk1 = positionYMesure.perk1 + 162;
        positionYMesure.perk2 = positionYMesure.perk2 + 162;
        positionYMesure.perk3 = positionYMesure.perk3 + 162;
        positionYMesure.perk4 = positionYMesure.perk4 + 162;
        positionYMesure.perk5 = positionYMesure.perk5 + 162;
        positionYMesure.perk6 = positionYMesure.perk6 + 162;
    } else if (position == nbplayer_blueside) {
        positionYMesure = positionYMesure_Save;
        positionXMesure.pseudo = positionXMesure.pseudo + 1730;
        positionXMesure.champ = positionXMesure.champ + 1267;
        positionXMesure.spell1 = positionXMesure.spell1 + 1239;
        positionXMesure.spell2 = positionXMesure.spell2 + 1239;
        positionXMesure.perk1 = positionXMesure.perk1 + 680;
        positionXMesure.perk2 = positionXMesure.perk2 + 680;
        positionXMesure.perk3 = positionXMesure.perk3 + 680;
        positionXMesure.perk4 = positionXMesure.perk4 + 680;
        positionXMesure.perk5 = positionXMesure.perk5 + 680;
        positionXMesure.perk6 = positionXMesure.perk6 + 680;
    } else {
        positionYMesure.pseudo = positionYMesure.pseudo + 162;
        positionYMesure.champ = positionYMesure.champ + 162;
        positionYMesure.spell1 = positionYMesure.spell1 + 162;
        positionYMesure.spell2 = positionYMesure.spell2 + 162;
        positionYMesure.perk1 = positionYMesure.perk1 + 162;
        positionYMesure.perk2 = positionYMesure.perk2 + 162;
        positionYMesure.perk3 = positionYMesure.perk3 + 162;
        positionYMesure.perk4 = positionYMesure.perk4 + 162;
        positionYMesure.perk5 = positionYMesure.perk5 + 162;
        positionYMesure.perk6 = positionYMesure.perk6 + 162;
    }
    // console.log(position);
    // console.log(positionXMesure);
    // console.log(positionYMesure);
}

function defaultSettings(){
    if (settings.team1Name == ""){
        settings.team1Name = "Blue Side";
    }
    if (settings.team2Name == ""){
        settings.team2Name = "Red Side";
    }
}
