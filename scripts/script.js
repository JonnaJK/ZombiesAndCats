const width = 5;
const height = 5;
const amountOfZombies = 3;
const amountOfPokemon = 5;
const characterMark = "O";
const zombieMark = "Z";
const pokemonMark = "";
const deadMark = "X";
const characterColor = "whitesmoke";
const zombieColor = "red";
const pokemonColor = "green";
const occupiedClass = "occupied";

var zombies = [];
var pokemon = [];
var pokemonPlacements = [];
var playerPosition;
var pokemonRescued = 0;
var pokemonKilled = 0;

const gameBoard = document.getElementById("gameBoard");

document.addEventListener('keypress', (event) => {
    var name = event.key;
    var code = event.code;
    if (name == "W" || name == "w")
        move("north");
    else if (name == "a" || name == "A")
        move("west");
    else if (name == "s" || name == "S")
        move("south");
    else if (name == "d" || name == "D")
        move("east");
    else
        alert(`You pressed an invalid key: ${name}`);
}, false);
setupGame();

async function setupGame() {
    createGameBoard();
    playerPosition = getRandomInteger(1, 26);
    placeCharacter(playerPosition, characterMark, characterColor);

    await placePokemon();
    placeZombies();
}

function clearValues() {
    zombies = [];
    pokemon = [];
    pokemonPlacements = [];
    pokemonRescued = 0;
    pokemonKilled = 0;

    document.getElementById("rescued").innerHTML = "<br>" + "Pokemon rescued: 0";
    document.getElementById("killed").innerHTML = "<br>" + "Pokemon killed: 0";
    changeImageHidden("zombie", "hidden", "");
    changeImageHidden("pokemon", "hidden", "");
}

function createGameBoard() {
    for (let i = 0; i < width * height; i++) {
        let div = document.createElement("div");
        div.id = "tile" + (i + 1);
        div.className = "item";
        gameBoard.appendChild(div);
    }
}

function placeCharacter(position, innerHTML, color) {
    let tile = document.getElementById("tile" + position);

    tile.classList.add(occupiedClass);
    tile.innerHTML = innerHTML;
    tile.style.color = color;

    if (innerHTML == characterMark)
        document.getElementById("currentRoom").style.backgroundImage.src = "images/rooms/room" + position + ".jpg";
}

function placeZombies() {
    for (let i = 0; i < amountOfZombies; i++) {
        let randomNumber = getRandomInteger(1, 26);
        let tile = document.getElementById("tile" + randomNumber);

        if (!elementHasClass(tile, occupiedClass)) {
            zombies.push(randomNumber);
            placeCharacter(randomNumber, zombieMark, zombieColor);
        }
        else {
            i--;
        }
    }
}

async function getPokemonFromAPI() {
    const url = "https://pokeapi.co/api/v2/pokemon/";
    for (let i = 0; i < amountOfPokemon; i++) {
        await fetch(url + getRandomInteger(1, 300))
            .then(function (response) { return response.json(); })
            .then(function (data) { pokemon.push(data); })
    }
}

async function placePokemon() {
    await getPokemonFromAPI();

    for (let i = 0; i < pokemon.length; i++) {

        var randomNumber = getRandomInteger(1, 26);
        let tile = document.getElementById("tile" + randomNumber);

        if (!elementHasClass(tile, occupiedClass)) {
            pokemonPlacements.push(randomNumber);
            placeCharacter(randomNumber, pokemonMark, pokemonColor);

            let imageInDiv = document.createElement("img");
            imageInDiv.src = pokemon[i].sprites.front_default;
            imageInDiv.id = "pokemon" + tile.id;

            tile.appendChild(imageInDiv);
        }
        else {
            i--;
        }
    }
}

function elementHasClass(element, className) {
    return element.classList.contains(className);
}

function removeCharacter(tileNumber) {
    let tile = document.getElementById("tile" + tileNumber);
    tile.innerHTML = "";
    tile.style.color = characterColor;
    tile.classList.remove(occupiedClass);
}

function movePlayer(addOrSub, steps) {
    let oldPosition = playerPosition;

    if (addOrSub == "add") {
        playerPosition += steps;
        checkForMatch(playerPosition);
    }
    else {
        playerPosition -= steps;
        checkForMatch(playerPosition);
    }

    removeCharacter(oldPosition);
    placeCharacter(playerPosition, characterMark, characterColor);
}

function move(direction) {
    switch (direction) {
        case "north":
            if (playerPosition > 5)
                movePlayer("sub", 5);
            break;

        case "east":
            if (playerPosition % 5 != 0)
                movePlayer("add", 1);
            break;

        case "south":
            if (playerPosition < 21)
                movePlayer("add", 5);
            break;

        case "west":
            if (playerPosition % 5 != 1)
                movePlayer("sub", 1);
            break;

        default:
            break;
    }
    changeRoomImage(playerPosition);
    moveZombies();
}

function placeZombie(tileNumber) {
    let tile = document.getElementById("tile" + tileNumber);
    tile.innerHTML = zombieMark;
    tile.style.color = zombieColor;
    tile.classList.add(occupiedClass);
}

function moveZombies() {
    for (let i = 0; i < zombies.length; i++) {

        if (getRandomInteger(0, 2) == 1) {
            removeCharacter(zombies[i]);

            // zombie gets a new position
            if (zombies[i] == 25)
                zombies[i] = 1;
            else
                zombies[i]++;

            // get zombies new tile
            let newTile = document.getElementById("tile" + zombies[i]);

            // check if and what character is on the new tile
            if (!newTile.classList.contains(occupiedClass)) {
                placeZombie(zombies[i]);
            }
            else if (newTile.innerHTML == zombieMark) {
                if (zombies[i] == 1)
                    zombies[i] = 25;
                else
                    zombies[i]--
                placeZombie(zombies[i]);
            }
            else if (newTile.innerHTML == characterMark) {
                placeCharacter(zombies[i], deadMark, zombieColor);
                changeImageHidden("zombie", "visible", ("images/zombies/zombie" + getRandomInteger(1, 11) + ".jpeg"));
                alert("Oh no, you have been killed by a zombie");
            }
            else {
                placeZombie(zombies[i]);
                alert("Oh no a Pokemon was eaten by a zombie");
                pokemonKilled++;
                document.getElementById("killed").innerHTML = "<br>" + "Pokemon killed: " + pokemonKilled;
            }
        }
    }

    if (pokemonRescued + pokemonKilled === amountOfPokemon) {
        alert("There is no more pokemon to rescue, you managed to rescue " + pokemonRescued + " pokemon... Restart the game");
    }
}

function changeRoomImage(number) {
    document.getElementById("currentRoom").src = "images/rooms/room" + number + ".jpg";
}

function changeImageHidden(idName, isHidden, src) {
    let image = document.getElementById(idName);
    image.src = src;
    image.style.visibility = isHidden;
}

function checkForMatch(nextTileNumber) {
    changeImageHidden("zombie", "hidden", "");
    changeImageHidden("pokemon", "hidden", "");

    let nextTile = document.getElementById("tile" + nextTileNumber);

    if (nextTile.classList.contains(occupiedClass)) {

        if (nextTile.innerHTML == zombieMark) {
            changeImageHidden("zombie", "visible", ("images/zombies/zombie" + getRandomInteger(1, 11) + ".jpeg"));
            alert("Oh no, you have been killed by a zombie, restart the game");
        }
        else {
            setSavedPokemonImage(nextTileNumber);
            pokemonRescued++;
            document.getElementById("rescued").innerHTML = "<br>" + "Pokemon rescued: " + pokemonRescued;
            placeCharacter(nextTileNumber, characterMark, characterColor);
        }
    }
}

function setSavedPokemonImage(nextTileNumber) {
    let smallImageSource = document.getElementById("pokemontile" + nextTileNumber).src;
    let foundPokemon = pokemon.find(x => x.sprites.front_default == smallImageSource);
    changeImageHidden("pokemon", "visible", foundPokemon.sprites.other.home.front_default);
}

function clearGame() {
    clearValues();
    document.getElementById("gameBoard").innerHTML = "";
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function restartGame() {
    clearGame();
    setupGame();
}