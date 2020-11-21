# lol-picture-generate-for-stream (Previously lol-runes-overlay)
A small Javascript software who retrieve data from Riot API to generate a pregame picture (Username, Champion, Summoners, and Perks {Runes]...) and a postgame picture on a game (Team win, stats, damage graph, gold graph...).

Works (but still under development)

How to use it ?
---
Clone the repertory in your computer

In settings.json, enter in APIKey your API development key (from Riot API : https://developer.riotgames.com/apis)

Next, you got the choice.

Case 1 : If you want to generate a picture of a now in-game match, just type the username of one of the player in the game you want to generate the picture in "accountName". It will only generate a pregame picture.

Case 2 : If you want to generate a picture of a past match, type the id of the match in "matchId". It will generate a pregame picture and a postgame picture.

Launch the software with a cmd and "node index.js"

If the player is not a game, it just stop the software without creating a picture.

Example :
---
Draft & Ranked Game pregame picture example :
![Example 1](https://github.com/Kla35/lol-runes-overlay/blob/master/picture_example.png)

Custom game pregame picture if there is 10 players in the game example :
![Example 1](https://github.com/Kla35/lol-runes-overlay/blob/master/picture_example2.png)

Postgame picture example :
![Example 1](https://github.com/Kla35/lol-runes-overlay/blob/master/picture_postgame_example.png)
