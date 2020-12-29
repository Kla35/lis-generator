const notifier = require('node-notifier');
button = document.getElementById("button");
username_input = document.getElementById("username");
apikey_input = document.getElementById("apikey");
matchid_input = document.getElementById("matchid");
eta_div = document.getElementById("etatdiv")
eta_text = document.getElementById("etatext");
subProgressBar = document.getElementById("myProgress");
progressBar = document.getElementById("myBar");
matchid_input.value = "5003935577";
apikey_input.value = "RGAPI-aff8fe37-d6cd-46af-9312-e36bc6065baf";
console.log(button);
console.log(eta_text);

button.addEventListener("click", function(){
    eta_div.classList.remove("hidden");
    changeETA("Reset du programme");
    resetData();
    changeETA("Ajout des valeurs")
    settings.accountName = username_input.value;
    settings.APIKey = apikey_input.value;
    settings.matchId = matchid_input.value;
    console.log("test");
    console.log(eta_text.innerHTML);
    console.log(settings.accountName);
    console.log(settings.APIKey);
    console.log(settings.matchId);
    console.log("test2");
    // notifier.notify({
    //     title: 'My notification',
    //     message: 'abcd :'
    //     });
        (async () => {
            game = null;
            timeline = null;
            changeETA("Recherche de la game...")
            //************Retrieve summoner and game*****************
            if(settings.accountName != ""){
                const playerAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/summoner/v4/summoners/by-name/"+settings.accountName+"?api_key="+settings.APIKey);
                const jsonPlayer = await playerAPI.json();
                const SummonerId = jsonPlayer["id"];
                const gameAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/spectator/v4/active-games/by-summoner/"+SummonerId+"?api_key="+settings.APIKey);
                game = await gameAPI.json();
            } else if (settings.matchId != ""){
                const gameAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/match/v4/matches/"+settings.matchId+"?api_key="+settings.APIKey);
                game = await gameAPI.json();
                const timelineAPI = await fetch("https://"+settings.server+".api.riotgames.com/lol/match/v4/timelines/by-match/"+settings.matchId+"?api_key="+settings.APIKey);
                timeline = await timelineAPI.json();
                var folder = await mkdirp(path+'/graphs/', { recursive: true });
                try {
                    await createArrayPlayer()
                  } catch (error) {
                    console.error("ERROR : Match id doesn't exit");
                    return;
                  }
                await createDamageGraphBlue();
                await createDamageGraphRed();
                await createGoldGraph();
            }
            //console.log(timeline);
            await initPlayersTeam();
        
            //console.log(game);
            changeETA("Vérification de l'existance de la partie")
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
            changeETA("Verification de la version...")
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
                changeETA("Téléchargement de la version de la partie : Téléchargement des runes")
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
                changeETA("Téléchargement de la version de la partie : Téléchargement des champions")
                subProgressBar.classList.remove("hidden");
                
                for(let b=0; b < tab_champ.length; b++){
                    await downloadChamp(tab_champ[b]);
                    progressBar.style.width = ((b/tab_champ.length)*100) + "%";
                    progressBar.innerHTML = ((b/tab_champ.length)*100).toFixed(2) + "%";
                }
                resetProgressBar();
                console.log("Downloaded champions !");
                console.log("Starting download of Spell...");
                changeETA("Téléchargement de la version de la partie : Téléchargement des sorts")
                subProgressBar.classList.remove("hidden");
                for(let c=0; c < tab_spell.length; c++){
                    await downloadSpell(tab_spell[c]);
                    progressBar.style.width = ((c/tab_spell.length)*100) + "%";
                    progressBar.innerHTML = ((c/tab_spell.length)*100).toFixed(2) + "%";
                }
                resetProgressBar();
                console.log("Downloaded Spell !");
                changeETA("Version de la partie téléchargé...")
                
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
            generateImagePerks();
            console.log("Picture generate !");
            console.log("Picture generate !");
            eta_div.classList.add("hidden");
        })();
}, false);
