function generateBanBlue(game){
    tab = [];
    if(settings.accountName != ""){
        game.bannedChampions.forEach(banned => {
            if(banned.teamId == 100){
                tab.push(translateChamp(banned.championId));
            }
        })
    } else if (settings.matchId != ""){
        game.teams.forEach(item =>{
            if (item.teamId == 100){
                item.bans.forEach(ban =>{
                    tab.push(translateChamp(ban.championId));
                })
            }
        })
    }
    return tab;
    
}

function generateBanRed(game){
    tab = [];
    if(settings.accountName != ""){
        game.bannedChampions.forEach(banned => {
            if(banned.teamId == 200){
                tab.push(translateChamp(banned.championId));
            }
        })
    } else if (settings.matchId != ""){
        game.teams.forEach(item =>{
            if (item.teamId == 200){
                item.bans.forEach(ban =>{
                    tab.push(translateChamp(ban.championId));
                })
            }
        })
    }
    return tab;
}
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
    } else {
        img = ''
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
      dest: path+'/data/'+version+"/en_US/"+item.icon
    }

    await verifyFSPerk(item.icon);
    
    await download.image(options).catch((err) => console.error(err))
}

//Download champion image from DDragon
async function downloadChamp(item){
    const options = {
      url: 'http://ddragon.leagueoflegends.com/cdn/'+version+'/img/champion/'+item.img,
      dest: path+'/data/'+version+"/en_US/champion/"+item.img
    }

    await verifyFSChamp();
    
    await download.image(options).catch((err) => console.error(err))
}

//Download spell image from DDragon
async function downloadSpell(item){
    const options = {
      url: 'http://ddragon.leagueoflegends.com/cdn/'+version+'/img/spell/'+item.img,
      dest: path+'/data/'+version+"/en_US/spell/"+item.img
    }

    await verifyFSSpell();
    
    await download.image(options).catch((err) => console.error(err))
}

//Download and store perk json from DDragon
async function downloadJSONperks(){
    const requestPerks = await fetch('http://ddragon.leagueoflegends.com/cdn/'+ version +'/data/en_US/runesReforged.json');
    const jsonChamp = await requestPerks.json();
    await fs.writeFile(path+'/data/'+version+"/en_US/runesReforged.json", JSON.stringify(jsonChamp), function (err) {
            if (err) return console.log(err);
    });
    return jsonChamp;
}

//Download and store champion json from DDragon
async function downloadJSONchamp(){
    const requestPerks = await fetch('http://ddragon.leagueoflegends.com/cdn/'+ version +'/data/en_US/champion.json');
    const jsonPerks = await requestPerks.json();
    await fs.writeFile(path+'/data/'+version+"/en_US/champion.json", JSON.stringify(jsonPerks), function (err) {
            if (err) return console.log(err);
    });
    return jsonPerks;
}

//Download and store spell json from DDragon
async function downloadJSONspell(){
    const requestPerks = await fetch('http://ddragon.leagueoflegends.com/cdn/'+ version +'/data/en_US/summoner.json');
    const jsonSpell = await requestPerks.json();
    await fs.writeFile(path+'/data/'+version+"/en_US/summoner.json", JSON.stringify(jsonSpell), function (err) {
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
    var returnFolder = await mkdirp(path+'/data/'+version+'/en_US/'+str_dest, { recursive: true });
}

//Verify if folder exist for Champ : If not, create it
async function verifyFSChamp(){
    await mkdirp(path+'/data/'+version+'/en_US/champion/', { recursive: true });
}

//Verify if folder exist for Spell : If not, create it
async function verifyFSSpell(){
    await mkdirp(path+'/data/'+version+'/en_US/spell/', { recursive: true });
}

//Generate image from data
async function generateImagePerks(){
    const width = 1920
    const height = 1080

    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')
    baseline_link = path+'/concept/baseline.png';
    if((game.gameType == "CUSTOM_GAME") && (game.participants.length == 10)){
        baseline_link = path+'/concept/baseline_draft.png'
    }
    //Base
    loadImage(baseline_link).then(async image => {
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
            await loadImage(settings.logoTeam1).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.team1, positionYMesurePerkz.team1, mesureXPerkz.team1, mesureYPerkz.team1);
            });
        } else {
            await loadImage(path+'/logo/defaultBlue.png').then(async image => {
                await context.drawImage(image, positionXMesurePerkz.team1, positionYMesurePerkz.team1, mesureXPerkz.team1, mesureYPerkz.team1);
            });
        }

        if(settings.logoTeam2 != ""){
            await loadImage(settings.logoTeam2).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.team2, positionYMesurePerkz.team2, mesureXPerkz.team2, mesureYPerkz.team2);
            });
        } else {
            await loadImage(path+'/logo/defaultRed.png').then(async image => {
                await context.drawImage(image, positionXMesurePerkz.team2, positionYMesurePerkz.team2, mesureXPerkz.team2, mesureYPerkz.team2);
            });
        }

        //Loop to generate picture for each player
        for(let g=0;g<game.participants.length;g++){
            await updatePositionPerkz();
            summoner = game.participants[g];
            //console.log(summoner);
            if (position>nbplayer_blueside){
                context.textAlign = 'right';
            }
            //Username
            if(summoner.summonerName.length > 12){
                context.font = 'bold 15pt Arial';
            }

            if(summoner.summonerName.length > 20){
                summoner.summonerName = summoner.summonerName.substring(0,18) + "..."
            }
            await context.fillText(summoner.summonerName, positionXMesurePerkz.pseudo, positionYMesurePerkz.pseudo);

            if(summoner.summonerName.length > 12){
                context.font = 'bold 20pt Arial';
            }
            //Champ Square
            await loadImage(path+'/default/champ_default.png').then(async image => {
                await context.drawImage(image, positionXMesurePerkz.champ, positionYMesurePerkz.champ, mesureXPerkz.champ, mesureYPerkz.champ);
            });

            await loadImage(path+'/data/'+version+'/en_US/champion/'+summoner.champImg).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.champ, positionYMesurePerkz.champ, mesureXPerkz.champ, mesureYPerkz.champ);
            }).catch(async error => {
                console.log("Image of a champ not find : " + summoner.champImg);
            });

            //Spell 1
            await loadImage(path+'/data/'+version+'/en_US/spell/'+summoner.spell1Img).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.spell1, positionYMesurePerkz.spell1, mesureXPerkz.spell1, mesureYPerkz.spell1);
            });

            //Spell 2
            await loadImage(path+'/data/'+version+'/en_US/spell/'+summoner.spell2Img).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.spell2, positionYMesurePerkz.spell2, mesureXPerkz.spell2, mesureYPerkz.spell2);
            });
            
            //Perk 1
            await loadImage(path+'/data/'+version+'/en_US/'+summoner.perks.perkIds[0].icon).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.perk1, positionYMesurePerkz.perk1, mesureXPerkz.perk1, mesureYPerkz.perk1);
            });

            //Perk 2
            await loadImage(path+'/data/'+version+'/en_US/'+summoner.perks.perkIds[1].icon).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.perk2, positionYMesurePerkz.perk2, mesureXPerkz.perk2, mesureYPerkz.perk2);
            });

            //Perk 3
            await loadImage(path+'/data/'+version+'/en_US/'+summoner.perks.perkIds[2].icon).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.perk3, positionYMesurePerkz.perk3, mesureXPerkz.perk3, mesureYPerkz.perk3);
            });

            //Perk 4
            await loadImage(path+'/data/'+version+'/en_US/'+summoner.perks.perkIds[3].icon).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.perk4, positionYMesurePerkz.perk4, mesureXPerkz.perk4, mesureYPerkz.perk4);
            });

            //Perk 5
            await loadImage(path+'/data/'+version+'/en_US/'+summoner.perks.perkIds[4].icon).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.perk5, positionYMesurePerkz.perk5, mesureXPerkz.perk5, mesureYPerkz.perk5);
            });

            //Perk 6
            await loadImage(path+'/data/'+version+'/en_US/'+summoner.perks.perkIds[5].icon).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.perk6, positionYMesurePerkz.perk6, mesureXPerkz.perk6, mesureYPerkz.perk6);
            });
        }

        //Add blue bans
        link = '';
        for(let k=0; k<game.banned_array_blue.length;k++){
            if(game.banned_array_blue[k] == ''){
                link = path+'/concept/no_ban.png';
            } else {
                link = path+'/data/'+version+'/en_US/champion/'+game.banned_array_blue[k];
            }
            await loadImage(link).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.ban, positionYMesurePerkz.ban, mesureXPerkz.ban, mesureYPerkz.ban);
            }).catch(async error => {
                console.log("Image of a champ not find : " + game.banned_array_blue[k]);
            });

            await loadImage(path+'/concept/ban_champ.png').then(async image => {
                await context.drawImage(image, positionXMesurePerkz.ban, positionYMesurePerkz.ban, mesureXPerkz.ban, mesureYPerkz.ban);
            });
            positionXMesurePerkz.ban = positionXMesurePerkz.ban + 109;
        }

        //Change position of ban image
        positionXMesurePerkz.ban = 1185;

        //Add red bans
        for(let k=0; k<game.banned_array_red.length;k++){
            if(game.banned_array_red[k] == ''){
                link = path+'/concept/no_ban.png';
            } else {
                link = path+'/data/'+version+'/en_US/champion/'+game.banned_array_red[k];
            }
            await loadImage(link).then(async image => {
                await context.drawImage(image, positionXMesurePerkz.ban, positionYMesurePerkz.ban, mesureXPerkz.ban, mesureYPerkz.ban);
            }).catch(async error => {
                console.log("Image of a champ not find : " + game.banned_array_red[k]);
            });

            await loadImage(path+'/concept/ban_champ.png').then(async image => {
                await context.drawImage(image, positionXMesurePerkz.ban, positionYMesurePerkz.ban, mesureXPerkz.ban, mesureYPerkz.ban);
            });
            positionXMesurePerkz.ban = positionXMesurePerkz.ban + 109;
        }

        const buffer = canvas.toBuffer('image/png')
        if(directory_path == ""){
            directory_path = ".\\";
        }
        await mkdirp(directory_path, { recursive: true });
        await fs.writeFileSync(directory_path+'picture_perkz.png', buffer)
        position = 0;
        console.log("Starting generate picture...");
        if(settings.matchId != "" && settings.accountName == ""){
            await changeETA("Generation postgame picture");
            await generateImagePostGame();
        }
        await changeETA("Image generated into : " + directory_path);
        await changeETAimg("success")
    });
}

async function generateImagePostGame(){
    const width = 1920
    const height = 1080
    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')
    baseline_link = path+'/concept/baseline_postgame.png';
    var blueStats = await checkBlueStats();
    var redStats = await checkRedStats();
    await checkDrake(blueStats, redStats);
    await prepareDrakePixel(blueStats, redStats);
    console.log(blueStats);
    console.log(redStats);
    //Base
    loadImage(baseline_link).then(async image => {
        context.drawImage(image, 0, 0, 1920, 1080);

        context.font = 'bold 36pt FjallaOne'
        context.textBaseline = 'bottom'
        context.textAlign = 'center';
        context.fillStyle = '#ffffff';

        
        await context.fillText(""+Math.floor(game.gameDuration/60)+":"+game.gameDuration%60, positionXMesurePostGame.timer, positionYMesurePostGame.timer);
        await context.fillText(blueStats.win, positionXMesurePostGame.winBlue, positionYMesurePostGame.winBlue);
        await context.fillText(redStats.win, positionXMesurePostGame.winRed, positionYMesurePostGame.winRed);
        await context.fillText(blueStats.tower, positionXMesurePostGame.towerBlue, positionYMesurePostGame.towerBlue);
        await context.fillText(redStats.tower, positionXMesurePostGame.towerRed, positionYMesurePostGame.towerRed);
        await context.fillText(blueStats.baron, positionXMesurePostGame.baronBlue, positionYMesurePostGame.baronBlue);
        await context.fillText(redStats.baron, positionXMesurePostGame.baronRed, positionYMesurePostGame.baronRed);
        //Page right
        await context.fillText(blueStats.kill + "/" + blueStats.death + "/" + blueStats.assist, positionXMesurePostGame.kdaBlue, positionYMesurePostGame.kdaBlue);
        await context.fillText(redStats.kill + "/" + redStats.death + "/" + redStats.assist, positionXMesurePostGame.kdaRed, positionYMesurePostGame.kdaRed);
        await context.fillText(blueStats.total_gold + " G", positionXMesurePostGame.total_goldBlue, positionYMesurePostGame.total_goldBlue);
        await context.fillText(redStats.total_gold + " G", positionXMesurePostGame.total_GoldRed, positionYMesurePostGame.total_GoldRed);
        await context.fillText(blueStats.vision_score, positionXMesurePostGame.visionScoreBlue, positionYMesurePostGame.visionScoreBlue);
        await context.fillText(redStats.vision_score, positionXMesurePostGame.visionScoreRed, positionYMesurePostGame.visionScoreRed);


        await context.save();
        await context.translate(canvas.width/2,canvas.height/2);
        await context.rotate(90*Math.PI/180);
         
        await loadImage(path+'/graphs/test.bar_blue.png').then(async image => {
            await context.drawImage(image, -160, -515, 300, 300);
        });
        await context.scale(1, -1);
        await loadImage(path+'/graphs/test.bar_red.png').then(async image => {
            await context.drawImage(image, -160, 525, 300, 300);
        });
        await context.restore();

        await loadImage(path+'/graphs/test.bar.png').then(async image => {
            await context.drawImage(image, 980, 780, 900, 300);
        });


        if(settings.logoTeam1 != ""){
            await loadImage(settings.logoTeam1).then(async image => {
                await context.drawImage(image, positionXMesurePostGame.team1, positionYMesurePostGame.team1, mesureXPostGame.team1, mesureYPostGame.team1);
            });
        } else {
            await loadImage(path+'/logo/defaultBlue.png').then(async image => {
                await context.drawImage(image, positionXMesurePostGame.team1, positionYMesurePostGame.team1, mesureXPostGame.team1, mesureYPostGame.team1);
            });
        }

        if(settings.logoTeam2 != ""){
            await loadImage(settings.logoTeam2).then(async image => {
                await context.drawImage(image, positionXMesurePostGame.team2, positionYMesurePostGame.team2, mesureXPostGame.team2, mesureYPostGame.team2);
            });
        } else {
            await loadImage(path+'/logo/defaultRed.png').then(async image => {
                await context.drawImage(image, positionXMesurePostGame.team2, positionYMesurePostGame.team2, mesureXPostGame.team2, mesureYPostGame.team2);
            });
        }

        for(let k=0; k<blueStats.drake.length;k++){
            drk = blueStats.drake[k];
            await loadImage(path+'/concept/'+drk.name+'.png').then(async image => {
                await context.drawImage(image, drk.x, drk.y, mesureXPostGame.drake, mesureYPostGame.drake);
            });
        }

        for(let k=0; k<redStats.drake.length;k++){
            drk = redStats.drake[k];
            await loadImage(path+'/concept/'+drk.name+'.png').then(async image => {
                await context.drawImage(image, drk.x, drk.y, mesureXPostGame.drake, mesureYPostGame.drake);
            });
        }

        for(let k=0; k<game.participants.length;k++){
            await updatePositionPostGame();
            summoner = game.participants[k];
            //Champ Square
            await loadImage(path+'/default/champ_default.png').then(async image => {
                await context.drawImage(image, positionXMesurePostGame.champ, positionYMesurePostGame.champ, mesureXPostGame.champ, mesureYPostGame.champ);
            });

            await loadImage(path+'/data/'+version+'/en_US/champion/'+summoner.champImg).then(async image => {
                await context.drawImage(image, positionXMesurePostGame.champ, positionYMesurePostGame.champ, mesureXPostGame.champ, mesureYPostGame.champ);
            }).catch(async error => {
                console.log("Image of a champ not find : " + summoner.champImg);
            });
            if(summoner.teamId == 100){
                await loadImage(path+'/default/champ_default.png').then(async image => {
                    await context.drawImage(image, positionXMesurePostGame.champDamageBlue, positionYMesurePostGame.champDamageBlue, mesureXPostGame.champDamageBlue, mesureYPostGame.champDamageBlue);
                });
    
                await loadImage(path+'/data/'+version+'/en_US/champion/'+summoner.champImg).then(async image => {
                    await context.drawImage(image, positionXMesurePostGame.champDamageBlue, positionYMesurePostGame.champDamageBlue, mesureXPostGame.champDamageBlue, mesureYPostGame.champDamageBlue);
                }).catch(async error => {
                    console.log("Image of a champ not find : " + summoner.champImg);
                });
                context.textAlign = 'left';
                context.font = 'bold 30pt FjallaOne'
                await context.fillText((summoner.stats.totalDamageDealtToChampions/1000).toFixed(1) + "k", positionXMesurePostGame.damageBlue, positionYMesurePostGame.damageBlue);
                context.textAlign = 'center';
                context.font = 'bold 36pt FjallaOne'
                positionYMesurePostGame.damageBlue = positionYMesurePostGame.damageBlue + 54;
                positionYMesurePostGame.champDamageBlue = positionYMesurePostGame.champDamageBlue + 54;
            }

            if(summoner.teamId == 200){
                await loadImage(path+'/default/champ_default.png').then(async image => {
                    await context.drawImage(image, positionXMesurePostGame.champDamageRed, positionYMesurePostGame.champDamageRed, mesureXPostGame.champDamageRed, mesureYPostGame.champDamageRed);
                });
    
                await loadImage(path+'/data/'+version+'/en_US/champion/'+summoner.champImg).then(async image => {
                    await context.drawImage(image, positionXMesurePostGame.champDamageRed, positionYMesurePostGame.champDamageRed, mesureXPostGame.champDamageRed, mesureYPostGame.champDamageRed);
                }).catch(async error => {
                    console.log("Image of a champ not find : " + summoner.champImg);
                });
                context.textAlign = 'right';
                context.font = 'bold 30pt FjallaOne'
                await context.fillText((summoner.stats.totalDamageDealtToChampions/1000).toFixed(1) + "k", positionXMesurePostGame.damageRed, positionYMesurePostGame.damageRed);
                context.textAlign = 'center';
                context.font = 'bold 36pt FjallaOne'
                positionYMesurePostGame.damageRed = positionYMesurePostGame.damageRed + 54;
                positionYMesurePostGame.champDamageRed = positionYMesurePostGame.champDamageRed + 54;
            }
            
        }
        //Add blue bans
        link = '';
        for(let k=0; k<game.banned_array_blue.length;k++){
            if(game.banned_array_blue[k] == ''){
                link = path+'/concept/no_ban.png';
            } else {
                link = path+'/data/'+version+'/en_US/champion/'+game.banned_array_blue[k];
            }
            await loadImage(link).then(async image => {
                await context.drawImage(image, positionXMesurePostGame.ban, positionYMesurePostGame.ban, mesureXPostGame.ban, mesureYPostGame.ban);
            }).catch(async error => {
                console.log("Image of a champ not find : " + game.banned_array_blue[k]);
            });

            await loadImage(path+'/concept/ban_champ.png').then(async image => {
                await context.drawImage(image, positionXMesurePostGame.ban, positionYMesurePostGame.ban, mesureXPostGame.ban, mesureYPostGame.ban);
            });
            positionXMesurePostGame.ban = positionXMesurePostGame.ban + 81;
        }

        //Change position of ban image
        positionXMesurePostGame.ban = 535;

        //Add red bans
        for(let k=0; k<game.banned_array_red.length;k++){
            if(game.banned_array_red[k] == ''){
                link = path+'/concept/no_ban.png';
            } else {
                link = path+'/data/'+version+'/en_US/champion/'+game.banned_array_red[k];
            }
            await loadImage(link).then(async image => {
                await context.drawImage(image, positionXMesurePostGame.ban, positionYMesurePostGame.ban, mesureXPostGame.ban, mesureYPostGame.ban);
            }).catch(async error => {
                console.log("Image of a champ not find : " + game.banned_array_red[k]);
            });

            await loadImage(path+'/concept/ban_champ.png').then(async image => {
                await context.drawImage(image, positionXMesurePostGame.ban, positionYMesurePostGame.ban, mesureXPostGame.ban, mesureYPostGame.ban);
            });
            positionXMesurePostGame.ban = positionXMesurePostGame.ban + 81;
        }

        const buffer = canvas.toBuffer('image/png')
        if(directory_path == ""){
            directory_path = ".\\";
        }
        mkdirp(directory_path, { recursive: true });
        fs.writeFileSync(directory_path+'picture_postgame.png', buffer)
    });
}

//Weird function. It update where object picture have to start (from top-left), depends on the nomber of player
function updatePositionPerkz(){
    if (position == nbplayer_blueside){
        positionYMesurePerkz = positionYMesurePerkz_Save;
        positionXMesurePerkz.pseudo = positionXMesurePerkz.pseudo + 1730;
        positionXMesurePerkz.champ = positionXMesurePerkz.champ + 1267;
        positionXMesurePerkz.spell1 = positionXMesurePerkz.spell1 + 1239;
        positionXMesurePerkz.spell2 = positionXMesurePerkz.spell2 + 1239;
        positionXMesurePerkz.perk1 = positionXMesurePerkz.perk1 + 680;
        positionXMesurePerkz.perk2 = positionXMesurePerkz.perk2 + 680;
        positionXMesurePerkz.perk3 = positionXMesurePerkz.perk3 + 680;
        positionXMesurePerkz.perk4 = positionXMesurePerkz.perk4 + 680;
        positionXMesurePerkz.perk5 = positionXMesurePerkz.perk5 + 680;
        positionXMesurePerkz.perk6 = positionXMesurePerkz.perk6 + 680;
    } else if (position == 0){
        console.log("Root 0");
    } else if (position < nbplayer_blueside) {
        positionYMesurePerkz.pseudo = positionYMesurePerkz.pseudo + 162;
        positionYMesurePerkz.champ = positionYMesurePerkz.champ + 162;
        positionYMesurePerkz.spell1 = positionYMesurePerkz.spell1 + 162;
        positionYMesurePerkz.spell2 = positionYMesurePerkz.spell2 + 162;
        positionYMesurePerkz.perk1 = positionYMesurePerkz.perk1 + 162;
        positionYMesurePerkz.perk2 = positionYMesurePerkz.perk2 + 162;
        positionYMesurePerkz.perk3 = positionYMesurePerkz.perk3 + 162;
        positionYMesurePerkz.perk4 = positionYMesurePerkz.perk4 + 162;
        positionYMesurePerkz.perk5 = positionYMesurePerkz.perk5 + 162;
        positionYMesurePerkz.perk6 = positionYMesurePerkz.perk6 + 162;
    } else {
        positionYMesurePerkz.pseudo = positionYMesurePerkz.pseudo + 162;
        positionYMesurePerkz.champ = positionYMesurePerkz.champ + 162;
        positionYMesurePerkz.spell1 = positionYMesurePerkz.spell1 + 162;
        positionYMesurePerkz.spell2 = positionYMesurePerkz.spell2 + 162;
        positionYMesurePerkz.perk1 = positionYMesurePerkz.perk1 + 162;
        positionYMesurePerkz.perk2 = positionYMesurePerkz.perk2 + 162;
        positionYMesurePerkz.perk3 = positionYMesurePerkz.perk3 + 162;
        positionYMesurePerkz.perk4 = positionYMesurePerkz.perk4 + 162;
        positionYMesurePerkz.perk5 = positionYMesurePerkz.perk5 + 162;
        positionYMesurePerkz.perk6 = positionYMesurePerkz.perk6 + 162;
    }
    position++;
    // console.log(position);
    // console.log(positionXMesurePerkz);
    // console.log(positionYMesurePerkz);
    
}

function updatePositionPostGame(){
    if (position == nbplayer_blueside){
        positionXMesurePostGame = positionXMesurePostGame_Save;
        positionXMesurePostGame.champ = positionXMesurePostGame.champ + 476;
    } else if (position == 0){
        console.log("Root 0");
    } else if (position < nbplayer_blueside) {
        positionXMesurePostGame.champ = positionXMesurePostGame.champ + 81;
    } else {
        positionXMesurePostGame.champ = positionXMesurePostGame.champ + 81;
    }
    position++;
    
}

async function checkBlueStats(){
    json = {}
    game.teams.forEach(team => {
        if (team.teamId == 100){
            if (team.win == "Fail"){
                json.win =  "LOSE";
            } else {
                json.win = "WIN";
            }
            json.baron = team.baronKills
            json.tower =  team.towerKills
        }
    });
    json.kill = 0;
    json.death = 0;
    json.assist = 0;
    json.total_gold = 0;
    json.vision_score = 0;
    game.participants.forEach(play=>{
        if (play.teamId == 100){
            json.kill = json.kill + play.stats.kills;
            json.death = json.death + play.stats.deaths;
            json.assist = json.assist + play.stats.assists;
            json.total_gold = json.total_gold + play.stats.goldEarned;
            json.vision_score = json.vision_score + play.stats.visionScore;
        }
    })
    return json;
}

async function checkRedStats(){
    json = {}
    game.teams.forEach(team => {
        if (team.teamId == 200){
            if (team.win == "Fail"){
                json.win =  "LOSE";
            } else {
                json.win = "WIN";
            }
            json.baron = team.baronKills
            json.tower =  team.towerKills
        }
    });
    json.kill = 0;
    json.death = 0;
    json.assist = 0;
    json.total_gold = 0;
    json.vision_score = 0;
    game.participants.forEach(play=>{
        if (play.teamId == 200){
            json.kill = json.kill + play.stats.kills;
            json.death = json.death + play.stats.deaths;
            json.assist = json.assist + play.stats.assists;
            json.total_gold = json.total_gold + play.stats.goldEarned;
            json.vision_score = json.vision_score + play.stats.visionScore;
        }
    });
    return json;
}

async function checkDrake(blueJson, redJson){
    blueJson.drake = [];
    redJson.drake = [];
    console.log(blueJson);
    timeline.frames.forEach(tl =>{
        tl.events.forEach(action => {
            if (action.type == "ELITE_MONSTER_KILL"){
                if(action.monsterType == "DRAGON"){
                    if(action.monsterSubType != ""){
                        if(blueSideId.includes(action.killerId)){
                            blueJson.drake.push({name: action.monsterSubType, x:0,y:0});
                        } else {
                            redJson.drake.push({name: action.monsterSubType, x:0,y:0});
                        }
                    }
                }
            }
        })
    })
}

async function initPlayersTeam(){
    game.participants.forEach(player => {
        if (player.teamId == 100){
            blueSideId.push(player.participantId);
        }
        if (player.teamId == 200){
            redSideId.push(player.participantId);
        }
    });
}

async function prepareDrakePixel(blueJson, redJson){
    //Blue team
    if (blueJson.drake.length > 0){
        moduloBlueDrake = blueJson.drake.length % 2;
        
        cutBlue = Math.floor(blueJson.drake.length / 2)
        firstX = 0;
        if(moduloBlueDrake == 0){
            firstX = positionXMesurePostGame.drakeBlueCenter - 21 - (42*(cutBlue-1));
        } else {
            console.log("modulo")
            firstX = positionXMesurePostGame.drakeBlueCenter - (42*(cutBlue));
        }
        blueJson.drake.forEach(json => {
            json.x = firstX;
            json.y = positionYMesurePostGame.drakeBlueCenter;
            firstX = firstX + 42;
        });
    }
    //Red team
    if (redJson.drake.length > 0){
        moduloRedDrake = redJson.drake.length % 2;
        cutRed = Math.floor(redJson.drake.length / 2)
        firstX = 0;
        if(moduloRedDrake == 0){
            firstX = positionXMesurePostGame.drakeRedCenter - 25 - (50*(cutRed-1));
        } else {
            firstX = positionXMesurePostGame.drakeRedCenter - (50*(cutRed));
        }
        redJson.drake.forEach(json => {
            json.x = firstX;
            json.y = positionYMesurePostGame.drakeRedCenter;
            firstX = firstX + 50;
        });
    }
}

async function createGoldGraph(){
    incrementTimeline = 0;
    timeline.frames.forEach(item=>{
        console.log(item);
        tmp = 0;
        blueSideId.forEach(participantId => {
            tmp = tmp + item.participantFrames[participantId].totalGold;
        })
        arrayBlueGold[incrementTimeline] = tmp;
        tmp = 0;
        redSideId.forEach(participantId => {
                tmp = tmp + item.participantFrames[participantId].totalGold;
            })
        arrayRedGold[incrementTimeline] = tmp;
        arrayChartGold[incrementTimeline] = arrayBlueGold[incrementTimeline] - arrayRedGold[incrementTimeline]
        arrayLabel[incrementTimeline] = incrementTimeline.toString();
        incrementTimeline++;
    });

    const cjs = new ChartJs(900, 300)
    
    var gradientFill = cjs.ctx.createLinearGradient(0, 0, 900, 350);
    
    gradientFill.addColorStop(0, 'blue');
    gradientFill.addColorStop(23/32, 'red');
    gradientFill.addColorStop(1, 'blue')
    
    const barConfig = {
      type: 'line',
      data: {
        labels: arrayLabel,
        datasets: [{
          data: arrayChartGold,
          backgroundColor: gradientFill,
          fill:'origin'
        //   backgroundColor: [
        //     'rgba(255, 99, 132, 0.2)',
        //     'rgba(54, 162, 235, 0.2)',
        //     'rgba(255, 206, 86, 0.2)',
        //     'rgba(75, 192, 192, 0.2)',
        //     'rgba(153, 102, 255, 0.2)',
        //     'rgba(255, 159, 64, 0.2)'
        // ],
          //backgroundColor: '#e04f31'
        }]
      },
      options: {
        title: {
          fontSize: 26,
          fontStyle: 'bold',
          display: false,
          text: 'Hours Online',
          // fontColor: '#818E9B',
          padding: 40
        },
        layout: {
          padding: 20,
          fontColor: '#FFFFFF'
        },
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              fontSize: 22,
              fontStyle: 'bold',
              padding: 40
            },
            gridLines: {
              color: '#F0F1F3',
              zeroLineColor: '#000000',
              drawBorder: false,
              tickMarkLength: 20
            }
          }],
          xAxes: [{
            barThickness: 40,
            ticks: {
              fontColor: '#D0D4D8',
              fontStyle: 'bold',
              fontSize: 22,
              display : false
            },
            gridLines: {
              drawOnChartArea: false,
              color: '#F0F1F3',
              zeroLineColor: '#F0F1F3',
              tickMarkLength: 20
            }
          }]
        }
      }
    }
    
    
    await cjs.makeChart(barConfig)
    await cjs.drawChart()
    await cjs.toFile(path+'/graphs/test.bar.png')
}

async function createDamageGraphRed(){
    const cjs = new ChartJs(300, 300);

const barConfig = {
  type: 'bar',
  data: {
    labels: [1, 2, 3, 4, 5],
    datasets: [{
      data: arrayDamageRed,
      backgroundColor : "#bd2222"
    }]
  },
  options: {
    title: {
      fontSize: 26,
      fontStyle: 'bold',
      display: false,
      text: 'Hours Online',
      // fontColor: '#818E9B',
      padding: 0
    },
    layout: {
      padding: 5,
      display: false
    },
    legend: {
      display: false
    },
    scales: {
      display: false,
      yAxes: [{
        ticks: {
          beginAtZero: true,
          // max: 12,
          // max,
          // suggestedMax: max,
          // fontColor: '#B7BCC2',
          fontSize: 22,
          display: false,
          fontStyle: 'bold',
          // stepSize,
          padding: 0
        },
        gridLines: {
          color: '#F0F1F3',
          zeroLineColor: '#F0F1F3',
          display : false,
          drawBorder: false,
          tickMarkLength: 20
        }
      }],
      xAxes: [{
        barThickness: 40,
        ticks: {
          display : false,
          // fontColor: '#D0D4D8',
          fontStyle: 'bold',
          fontSize: 22
        },
        gridLines: {
          drawOnChartArea: false,
          color: '#F0F1F3',
          zeroLineColor: '#F0F1F3',
          tickMarkLength: 20
        }
      }]
    }
  }
}

await cjs.makeChart(barConfig)
await cjs.drawChart()
await cjs.toFile(path+'/graphs/test.bar_red.png')


}

async function createDamageGraphBlue(){
    const cjs = new ChartJs(300, 300);

const barConfig = {
  type: 'bar',
  data: {
    labels: [1, 2, 3, 4, 5],
    datasets: [{
      data: arrayDamageBlue,
      backgroundColor : "#2a49c7"
    }]
  },
  options: {
    title: {
      fontSize: 26,
      fontStyle: 'bold',
      display: false,
      text: 'Hours Online',
      // fontColor: '#818E9B',
      padding: 0
    },
    layout: {
      padding: 5,
      display: false
    },
    legend: {
      display: false
    },
    scales: {
      display: false,
      yAxes: [{
        ticks: {
          beginAtZero: true,
          // max: 12,
          // max,
          // suggestedMax: max,
          // fontColor: '#B7BCC2',
          fontSize: 22,
          display: false,
          fontStyle: 'bold',
          // stepSize,
          padding: 0
        },
        gridLines: {
          color: '#F0F1F3',
          display :false,
          zeroLineColor: '#F0F1F3',
          drawBorder: false,
          tickMarkLength: 20
        }
      }],
      xAxes: [{
        barThickness: 40,
        ticks: {
          display : false,
          // fontColor: '#D0D4D8',
          fontStyle: 'bold',
          fontSize: 22
        },
        gridLines: {
          drawOnChartArea: false,
          color: '#F0F1F3',
          zeroLineColor: '#F0F1F3',
          tickMarkLength: 20
        }
      }]
    }
  }
}

await cjs.makeChart(barConfig)
await cjs.drawChart()
await cjs.toFile(path+'/graphs/test.bar_blue.png')


}

async function createArrayPlayer(){
    game.participants.forEach(player => {
        if (player.teamId == 100){
            blueSideId.push(player.participantId);
            arrayDamageBlue.push(player.stats.totalDamageDealtToChampions);
        }
        if (player.teamId == 200){
            redSideId.push(player.participantId);
            arrayDamageRed.push(player.stats.totalDamageDealtToChampions);
        }
    });
}

function resetProgressBar(){
    subProgressBar.classList.add("hidden");
    progressBar.innerHTML = "0%"
    progressBar.style.width = "0%"
}

function changeETA(str){
    eta_text.innerHTML = str;
}

function changeETAimg(str){
    switch(str){
        case("error"):
            eta_image.src=path+"/default/error.png";
            break;
        case("loading"):
            eta_image.src=path+"/default/loading.gif";
            break;
        case("success"):
            eta_image.src=path+"/default/valid.png";
            break;
    }
    
}

function retrieveData(){
    settings.accountName = username_input.value;
    settings.APIKey = apikey_input.value;
    settings.matchId = matchid_input.value;
    settings.server = server_select.value;
    settings.team1Name = blueName_input.value;
    settings.team2Name = redName_input.value;
    directory_path = directorypath_input.value;
}

function resetData(){
    game = null;
    timeline = null;
    tab_runes = [];
    tab_champ = [];
    tab_spell = [];
    version = 0;
    position = 0;
    nbplayer_blueside = 0;
    blueSideId = [];
    redSideId = [];

    //Script Variable for Graph
    blueSideId = [];
    redSideId = [];
    arrayBlueGold = [];
    arrayRedGold = [];
    arrayChartGold = [];
    arrayLabel = [];
    arrayDamageBlue = [];
    arrayDamageRed = [];

    positionXMesurePerkz = {pseudo : 88, champ : 274, spell1:302, spell2:344,perk1:417, perk2: 542, perk3: 655, perk4: 768,perk5:426,perk6:542, team1: 170, team2:1620, ban :231};
    positionXMesurePerkz_Save = {pseudo : 88, champ : 274, spell1:302, spell2:344,perk1:417, perk2: 542, perk3: 655, perk4: 768,perk5:426,perk6:542, team1: 170, team2:1620, ban :231};
    positionYMesurePerkz = {pseudo : 315, champ : 162, spell1:274, spell2:274,perk1:162, perk2: 168, perk3: 168, perk4: 168,perk5:245,perk6:245, team1: 25, team2:25, ban :986};
    positionYMesurePerkz_Save = {pseudo : 315, champ :162, spell1:274, spell2:274,perk1:162, perk2: 168, perk3: 168, perk4: 168,perk5:245,perk6:245, team1:25, team2: 25, ban :986};

    positionXMesurePostGame = {champ : 59, ban :59, team1:168, team2:664,timer:495,winBlue:253,winRed:757,towerBlue:321,towerRed:685,baronBlue:321,baronRed:685,drakeBlueCenter:298,drakeRedCenter:661,kdaBlue:1253,kdaRed:1721,total_goldBlue:1253,total_GoldRed:1721,visionScoreBlue:1253,visionScoreRed:1721,champDamageBlue:1146,champDamageRed:1763,damageBlue:1201,damageRed:1757};
    positionXMesurePostGame_Save = {champ : 59, ban :59, team1:168, team2:664,timer:495,winBlue:253,winRed:757,towerBlue:321,towerRed:685,baronBlue:321,baronRed:685,drakeBlueCenter:298,drakeRedCenter:661,kdaBlue:1253,kdaRed:1721,total_goldBlue:1253,total_GoldRed:1721,visionScoreBlue:1253,visionScoreRed:1721,champDamageBlue:1146,champDamageRed:1763,damageBlue:1201,damageRed:1757};
    positionYMesurePostGame = {champ : 575, ban :759, team1:181, team2:181,timer:450,winBlue:442,winRed:442,towerBlue:942,towerRed:942,baronBlue:1054,baronRed:1054,drakeBlueCenter:942,drakeRedCenter:942,kdaBlue:169,kdaRed:169,total_goldBlue:230,total_GoldRed:230,visionScoreBlue:291,visionScoreRed:291,champDamageBlue:407,champDamageRed:407,damageBlue:459,damageRed:459};
    positionYMesurePostGame_Save = {champ : 575, ban :759, team1:181, team2:181,timer:450,winBlue:442,winRed:442,towerBlue:942,towerRed:942,baronBlue:1044,baronRed:1044,drakeBlueCenter:942,drakeRedCenter:942,kdaBlue:169,kdaRed:169,total_goldBlue:230,total_GoldRed:230,visionScoreBlue:291,visionScoreRed:291,champDamageBlue:407,champDamageRed:407,damageBlue:459,damageRed:459};
}