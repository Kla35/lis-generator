function selectFileBlue(e){
    //console.log(e.target.files[0].path);
    settings.logoTeam1 = e.target.files[0].path;
    blueIconPath_input.value = settings.logoTeam1;
    blueIconPath_button.classList.remove("hidden");
}

function selectFileRed(e){
    //console.log(e.target.files[0].path);
    settings.logoTeam2 = e.target.files[0].path;
    redIconPath_input.value = settings.logoTeam2;
    redIconPath_button.classList.remove("hidden");
}