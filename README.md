# lol-runes-overlay
A small Javascript software who retrieve data from Riot API to generate a picture of many informations on a game (Username, Champion, Summoners, and Perks {Runes])

Works (but still under development)

How to use it ?
---

In settings.json, enter in APIKey your API development key (from Riot API : https://developer.riotgames.com/apis)

Next, you got the choice.

Case 1 : If you want to generate a picture of a now in-game match, just type the username of one of the player in the game you want to generate the picture in "accountName"

Case 2 : If you want to generate a picture of a past match, type the id of the match in "matchId"

Launch the software with a cmd and "node index.js"

If the player is not a game, it just stop the software without creating a picture.

Example :
---
Draft & Ranked Game picture example :
![Example 1](https://github.com/Kla35/lol-runes-overlay/blob/master/picture_example.png)

Custom game if there is 10 players in the game picture example :
![Example 1](https://github.com/Kla35/lol-runes-overlay/blob/master/picture_example2.png)
