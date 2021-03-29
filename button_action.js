const notifier = require('node-notifier');
button = document.getElementById("button");
button2 = document.getElementById("button2");
button3 = document.getElementById("button3");
buttonMVP = document.getElementById("buttonMVP");
username_input = document.getElementById("username");
apikey_input = document.getElementById("apikey");
matchid_input = document.getElementById("matchid");
eta_div = document.getElementById("etatdiv")
eta_text = document.getElementById("etatext");
eta_image = document.getElementById("etaimage");
server_select = document.getElementById("server-select");

blueName_input = document.getElementById("blueTeamName");
blueIconPath_button = document.getElementById("cancelBlueIcon");
blueIconPath_input = document.getElementById("blueTeamIconPath");
redName_input = document.getElementById("redTeamName");
redIconPath_button = document.getElementById("cancelRedIcon");
redIconPath_input = document.getElementById("redTeamIconPath");

subProgressBar = document.getElementById("myProgress");
progressBar = document.getElementById("myBar");

console.log(button);
console.log(eta_text);

blueIconPath_button.addEventListener("click", function(){
    blueIconPath_input.value = "";
    document.getElementById("blueTeamIcon").value = "";
    settings.logoTeam1 = "";
    blueIconPath_button.classList.add("hidden");
});

redIconPath_button.addEventListener("click", function(){
    redIconPath_input.value = "";
    document.getElementById("redTeamIcon").value = "";
    settings.logoTeam2 = "";
    redIconPath_button.classList.add("hidden");
});

buttonMVP.addEventListener("click",function(){
    id_mvp = document.getElementById("mvp_nb").value;
    fetch(url2, {method:'GET',
        headers: headers, agent
    })
    .then(response => response.json())
    .then(async json => {
        resetData();
        retrieveData();
        const requestVersion = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const jsonVersion = await requestVersion.json();
        version = jsonVersion[0];
        var jsonChamp = require(path+'/data/'+version+"/en_US/champion.json");
        createChampJSON(jsonChamp);
        game = require("./eog-stats-block.json");
        //game = json;
        generateImageMVP(id_mvp);
    })
});

button3.addEventListener("click",function(){
    fetch(url2, {method:'GET',
        headers: headers, agent
    })
    .then(response => response.json())
    .then(json => {
        console.log(json);
    })
        
});
button2.addEventListener("click",function(){
    fetch(url2, {method:'GET',
        headers: headers, agent
    })
    .then(response => response.json())
    .then(json => {
        resetData();
        game = require("./eog-stats-block.json");
        // game = json;
        game.teams[0].players.forEach(p => {
            if(p.teamId == 100){
                nbplayer_blueside++;
            }
        });
        createArrayPlayer_lcu();
        console.log(arrayDamageBlue);
        console.log(arrayDamageRed);
        createDamageGraphBlue().then(graph1 => {
            createDamageGraphRed().then(async graph2 => {
                //createGoldGraph();
                const requestVersion = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
                const jsonVersion = await requestVersion.json();
                version = jsonVersion[0];
                retrieveData();
                var jsonChamp = require(path+'/data/'+version+"/en_US/champion.json");
                createChampJSON(jsonChamp);
                generateImagePostGame(true);
            })
        })
    });
});

button.addEventListener("click", function(){
    eta_div.classList.remove("hidden");
    changeETAimg("loading");
    changeETA("Reset");
    resetData();
    changeETA("Add value")
    retrieveData();
    defaultSettings();
    console.log(settings);
    // notifier.notify({
    //     title: 'My notification',
    //     message: 'abcd :'
    //     });
        (async () => {
            game = {};
            timeline = null;
            changeETA("Research game...")
            //************Retrieve summoner and game*****************
            if((settings.accountName == "") &&  (settings.matchId == "")){
                await changeETA("No input in username or match id");
                await changeETAimg("error");
                return
            }
            if(settings.accountName != ""){
                const playerAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/summoner/v4/summoners/by-name/"+settings.accountName+"?api_key="+settings.APIKey);
                const jsonPlayer = await playerAPI.json();
                console.log("ebd");
                await console.log(jsonPlayer);
                if (game.hasOwnProperty('status')) {
                    if((jsonPlayer.status["status_code"] == 403)||(jsonPlayer.status["status_code"] == 401)){
                        await changeETA("API Key not valid");
                        await changeETAimg("error");
                        return
                        
                    } else if (jsonPlayer.status["status_code"] == 404){
                        await changeETA("Summoner name not found");
                        await changeETAimg("error"); 
                        return
                    }
                }
                const SummonerId = jsonPlayer["id"];
                const gameAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/spectator/v4/active-games/by-summoner/"+SummonerId+"?api_key="+settings.APIKey);
                game = await gameAPI.json();
            } else if (settings.matchId != ""){
                const gameAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/match/v4/matches/"+settings.matchId+"?api_key="+settings.APIKey);
                game = await gameAPI.json();
                if (game.hasOwnProperty('status')) {
                    if((game.status["status_code"] == 403)||(game.status["status_code"] == 401)){
                        await changeETA("API Key not valid");
                        await changeETAimg("error");
                        return
                        
                    } else if (game.status["status_code"] == 404){
                        await changeETA("Game doesn't exist (wrong match id)");
                        await changeETAimg("error"); 
                        return
                    }
                }
                const timelineAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/match/v4/timelines/by-match/"+settings.matchId+"?api_key="+settings.APIKey);
                timeline = await timelineAPI.json();
                var folder = await mkdirp(path+'/graphs/', { recursive: true });
                try {
                    await createArrayPlayer()
                  } catch (error) {
                    await changeETA("Match id doesn't exit");
                    await changeETAimg("error");
                    console.error("ERROR : Match id doesn't exit");
                    return;
                  }
                await createDamageGraphBlue();
                await createDamageGraphRed();
                await createGoldGraph();
            }
            await console.log(timeline);
            await initPlayersTeam();
        
            //console.log(game);
            changeETA("Verify if game exists...")
            //Check if player is now in game (Expect in coop vs IA). If yes, push the number of blue player
            if(game.gameId == undefined){
                console.log("This player is not in game / This game don't exist !")
                return;
            } else {
                game.participants.forEach(p => {
                    if(p.teamId == 100){
                        nbplayer_blueside++;
                    }
                });
                //console.log(nbplayer_blueside);
            }
            changeETA("Verify if version exists...")
            //*************Retrieve actual version or old version (depends if the match is now or played)*****************
            version = null;
            if (settings.accountName != ""){
                const requestVersion = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
                const jsonVersion = await requestVersion.json();
                version = jsonVersion[0];
            } else if (settings.matchId != ""){
                splitVersion = game.gameVersion.split(".");
                version = splitVersion[0]+"."+splitVersion[1]+".1";
            }
            
            //console.log(version);
        
            //**************Create folder (if new version)*************
            var returnFolder = await mkdirp(path+'/data/'+version+'/en_US/', { recursive: true });
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
                changeETA("Download game version ("+ version +") : Perkz download");
                subProgressBar.classList.remove("hidden");
        
                for(let a=0; a < tab_runes.length; a++){
                    await downloadPerk(tab_runes[a]);
                    progressBar.style.width = ((a/tab_runes.length)*100) + "%";
                    progressBar.innerHTML = ((a/tab_runes.length)*100).toFixed(2) + "%";
                }
                resetProgressBar();
                // b1.stop();
                console.log("Downloaded Perks !");
        
                console.log("Starting download of champions...");
                changeETA("Download game version ("+ version +") : Champions download");
                subProgressBar.classList.remove("hidden");
                
                for(let b=0; b < tab_champ.length; b++){
                    await downloadChamp(tab_champ[b]);
                    await downloadChampLoading(tab_champ[b]);
                    progressBar.style.width = ((b/tab_champ.length)*100) + "%";
                    progressBar.innerHTML = ((b/tab_champ.length)*100).toFixed(2) + "%";
                }
                resetProgressBar();
                console.log("Downloaded champions !");
                console.log("Starting download of Spell...");
                changeETA("Téléchargement de la version de la partie : Téléchargement des sorts")
                changeETA("Download game version ("+ version +") : Spell download");
                subProgressBar.classList.remove("hidden");
                for(let c=0; c < tab_spell.length; c++){
                    await downloadSpell(tab_spell[c]);
                    progressBar.style.width = ((c/tab_spell.length)*100) + "%";
                    progressBar.innerHTML = ((c/tab_spell.length)*100).toFixed(2) + "%";
                }
                resetProgressBar();
                console.log("Downloaded Spell !");
                changeETA("Game version downloaded...")
                
            } else {
                //Else, just load perks
                var jsonPerks = require(path+'/data/'+version+"/en_US/runesReforged.json");
                var jsonChamp = require(path+'/data/'+version+"/en_US/champion.json");
                var jsonSpell = require(path+'/data/'+version+"/en_US/summoner.json");
                createPerksJSON(jsonPerks);
                createChampJSON(jsonChamp);
                createSpellJSON(jsonSpell);
            }
        
            /* Prepare data for image generation*/
            await changeETA("Prepare data for generation");
            game.participants.forEach(summoner => {
                list_perks = [];
                if(settings.accountName != ""){
                    list_perks = summoner.perks.perkIds;
                } else if (settings.matchId != ""){
                    summoner.perks = {};
                    summoner.summonerName = game.participantIdentities[summoner.participantId-1].player.summonerName;
                    tab_str_perks = ["perk0","perk1","perk2","perk3","perk4","perk5"];
                    tab_str_perks.forEach(item =>{
                        list_perks.push(summoner.stats[item]);
                    })
                }
                console.log(list_perks);
                summoner.perks.perkIds = translatePerkz(list_perks);
                summoner.champImg = translateChamp(summoner.championId);
                summoner.spell1Img = translateSpell(summoner.spell1Id);
                summoner.spell2Img = translateSpell(summoner.spell2Id);
                //console.log(summoner);
                //console.log(summoner.perks);
            });
        
            game.banned_array_blue = generateBanBlue(game);
            game.banned_array_red = generateBanRed(game);
        
            //Generate Image
            console.log("Starting generate picture...");
            await changeETA("Generation perkz picture");
            generateImagePerks();
            console.log("Picture generate !");
            console.log("Picture generate !");
            //eta_div.classList.add("hidden");
        })();
}, false);
