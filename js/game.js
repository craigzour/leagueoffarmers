
var CameloteEngine = new Camelote(180, 90);

var action = 'none';
var typeOfBuilding = 'none';
var typeOfCrop = 'none';

function loop() {
  // Clock system
  var now = Date.now();

  // Engine loop
  CameloteEngine.update(now);
  CameloteEngine.draw();

  // "User" loop
  update(now);
  draw(now);

  webkitRequestAnimationFrame(arguments.callee, CameloteEngine.getCanvas());
}

function update(delay) {
  for (var i = 0; i < farmers.length; i++) {
    farmers[i].update(delay, CameloteEngine, player.id);
  }
}

function draw(delay) {
  for (var i = 0; i < farmers.length; i++) {
    farmers[i].draw(CameloteEngine.getGlobalOffsetX(), CameloteEngine.getGlobalOffsetY(), delay);
  }
}

function mouseControls() {
  if (window.event) {
    // Mouse controls
    switch (window.event.button) {
      // Left click
      case 0:
        var selectedTile = CameloteEngine.getTileByMousePositions();
        var userFarmer = farmers[getPlayerIndex(player.id)].getBaseEntity();
        switch (action) {
          case 'conquer':
            if (CameloteEngine.isFarmerNearTile(userFarmer, selectedTile)) {
              if (selectedTile.getOwnerId() == null) {
                //own tile
                Network.attackTile(selectedTile);
              }
              else if (selectedTile.getOwnerId() != player.id) {
                //fight owner
                alert("PREPARE TO FIGHT !!!");
              }
            }
          break;
          case 'build':
            if (CameloteEngine.isFarmerNearTile(userFarmer, selectedTile)) {
              if (selectedTile.getOwnerId() == player.id) {
                if (selectedTile.getContent() == null) {
                  Network.build(typeOfBuilding, selectedTile);
                }
                else {
                  alert("This land is already in use !!!");
                }
              }
              else {
                alert("This is not your land !!!");
              }
            }
            break;
          case 'plant':
            if (CameloteEngine.isFarmerNearTile(userFarmer, selectedTile)) {
              if (selectedTile.getOwnerId() == player.id) {
                if (selectedTile.getContent() == null) {
                  Network.plant(typeOfCrop, selectedTile);
                }
                else {
                  alert("This land is already in use !!!");
                }
              }
              else {
                alert("This is not your land !!!");
              }
            }
            break;
          case 'harvest':
            if (CameloteEngine.isFarmerNearTile(userFarmer, selectedTile)) {
              if (selectedTile.getOwnerId() == player.id) {
                if (selectedTile.getContent().contentType == 'crops') {
                  if (selectedTile.getContent().maturation >= 80) {
                    if (player.cropsCurrentlyHarvested == null) {
                      Network.harvest(selectedTile);
                    }
                    else {
                      alert('You cart is full, you have to empty it.');
                    }
                  }
                  else {
                    alert('This crop maturity is not good enough.');
                  }
                }
                else {
                  alert('This land cannot be harvested.');
                }
              }
              else {
                alert("This is not your land !!!");
              }
            }
            break;
          case 'watering':
            if (CameloteEngine.isFarmerNearTile(userFarmer, selectedTile)) {
              if (selectedTile.getOwnerId() == player.id || selectedTile.getOwnerId() == null) {
                Network.watering(selectedTile);
              }
              else {
                alert("This is not your land !!!");
              }
            }
            break;
          case 'fertilizing':
            if (CameloteEngine.isFarmerNearTile(userFarmer, selectedTile)) {
              if (selectedTile.getOwnerId() == player.id || selectedTile.getOwnerId() == null) {
                Network.fertilize(selectedTile);
              }
              else {
                alert("This is not your land !!!");
              }
            }
            break;
          case 'store':
            if (selectedTile.getOwnerId() == player.id && selectedTile.getContent().contentType == 'building') {
              Network.storeHarvest(selectedTile);
            }
            else {
              alert("This is not an available place to store your harvest !!!");
            }
            break;
          default:
            break;
        }
        resetPressedKey();
        break;
      // Right click
      case 2:
        var nextFarmerTile = CameloteEngine.getTileByMousePositions();
        if (nextFarmerTile != null && nextFarmerTile.getCanWalkOn()) {
          if (farmers[getPlayerIndex(player.id)].getBaseEntity().moveTo(nextFarmerTile, CameloteEngine)) {
            if (!withoutConnection)
              Network.updatePlayer(nextFarmerTile);
          }
        }
      break;
      default:
      break;
    }
  }
}

function keyboardControls(key) {
  // Keyboard controls
  switch (key.keyCode) {
    // SPACE BAR
    case 32:
      CameloteEngine.moveMapOnUser(farmers[getPlayerIndex(player.id)].getBaseEntity());
      break;
    // A
    case 65:
      if (!resetPressedKey()) {
        action = 'conquer';
      }
      break;
    // Z
    case 90:
      if (!resetPressedKey()) {
        action = 'harvest';
      }
      break;
    // E
    case 69:
      if (!resetPressedKey()) {
        action = 'watering';
      }
      break;
    // R
    case 82:
      if (!resetPressedKey()) {
        action = 'fertilizing';
      }
      break;
    // W
    case 87:
      if (!resetPressedKey()) {
        action = 'build';
        typeOfBuilding = 'silo';
      }
      break;
    // X
    case 88:
      if (!resetPressedKey()) {
        action = 'build';
        typeOfBuilding = 'barn';
      }
      break;
    // C
    case 67:
      if (!resetPressedKey()) {
        action = 'build';
        typeOfBuilding = 'cold_storage';
      }
      break;
    // Q
    case 81:
      if (!resetPressedKey()) {
        action = 'plant';
        typeOfCrop = 'tomato';
      }
      break;
    // S
    case 83:
      if (!resetPressedKey()) {
        action = 'plant';
        typeOfCrop = 'corn';
      }
      break;
    // D
    case 68:
      if (!resetPressedKey()) {
        action = 'plant';
        typeOfCrop = 'wheat';
      }
      break;
    // T
    case 84:
      if (!resetPressedKey()) {
        if (player.cropsCurrentlyHarvested) {
          sellHarvest();
        }
      }
      break;
    // Y
    case 89:
      if (!resetPressedKey()) {
        if (player.cropsCurrentlyHarvested) {
          action = 'store';
        }
      }
      break;
    default :
      resetPressedKey();
      break;
  }
}

function resetPressedKey() {
  if (action != 'none') {
    action = typeOfBuilding = typeOfCrop = 'none';
    return true;
  }
  return false;
}

function sellHarvest() {
  var cropsPrice = 0;
  switch (player.cropsCurrentlyHarvested.type) {
    case 'tomato':
      cropsPrice = tomatoPrice;
      break;
    case 'corn':
      cropsPrice = cornPrice;
      break;
    case 'wheat':
      cropsPrice = wheatPrice;
      break;
    default:
      break;
  }
  if (confirm("Do you really want to sell your harvest ? Current price : " + cropsPrice)) {
    Network.sellHarvest();
  }
}

function addEnnemy(e) {
  var newEnnemy = null;
  newEnnemy = new Farmer(e.id, CameloteEngine.getMap()[e.position.x][e.position.y], 60, 100, CameloteEngine.getImageResources('farmer'), CameloteEngine.getCanvasContext());
  farmers.push(newEnnemy);
}

function updateEnnemy(e) {
  var idEnnemy = getPlayerIndex(e.id);
  if (idEnnemy != -1) {
    farmers[idEnnemy].getBaseEntity().moveTo(CameloteEngine.getMap()[e.position.x][e.position.y], CameloteEngine);
  }
}

function isPlayerExist(id) {
  for (var i = 0; i < farmers.length; i++) {
    if (farmers[i].id === 'player_' + id)
      return true;
  }
  return false;
}

function getPlayerIndex(id) {
  for (var i = 0; i < farmers.length; i++) {
    if (farmers[i].id === 'player_' + id)
      return i;
  }
  return -1;
}

function main() {
  // Preparing Camelote engine
  CameloteEngine.start();

  CameloteEngine.loadImage('grass', 'assets/grass.png');
  CameloteEngine.loadImage('water', 'assets/water.gif');
  CameloteEngine.loadImage('farmer', 'assets/cowboy.png');
  CameloteEngine.loadImage('tomato1', 'assets/tomato1.gif');
  CameloteEngine.loadImage('corn1', 'assets/corn1.gif');
  CameloteEngine.loadImage('wheat1', 'assets/wheat1.gif');
  CameloteEngine.loadImage('tomato2', 'assets/tomato2.gif');
  CameloteEngine.loadImage('corn2', 'assets/corn2.gif');
  CameloteEngine.loadImage('wheat2', 'assets/wheat2.gif');
  CameloteEngine.loadImage('tomato3', 'assets/tomato3.gif');
  CameloteEngine.loadImage('corn3', 'assets/corn3.gif');
  CameloteEngine.loadImage('wheat3', 'assets/wheat3.gif');
  CameloteEngine.loadImage('silo', 'assets/silo.gif');
  CameloteEngine.loadImage('barn', 'assets/barn.gif');
  CameloteEngine.loadImage('cold_storage', 'assets/cold_storage.gif');
  CameloteEngine.loadImage('rain', 'assets/rain.gif');

  CameloteEngine.loadJsonMap(Network.serverMap);

  CameloteEngine.getCanvas().addEventListener('mouseup', function() {
    mouseControls();
  }, false);
  window.addEventListener('keydown', keyboardControls, true);

  var myFarmer = new Farmer(player.id, CameloteEngine.getMap()[0][0], 74, 99, CameloteEngine.getImageResources('farmer'), CameloteEngine.getCanvasContext());
  farmers.push(myFarmer);

  if (!withoutConnection)
    farmers[getPlayerIndex(player.id)].getBaseEntity().setCurrentTile(CameloteEngine.getMap()[player.position.x][player.position.y]);

  CameloteEngine.moveMapOnUser(farmers[getPlayerIndex(player.id)].getBaseEntity());
  CameloteEngine.getHud().setPlayerToFollow(farmers[getPlayerIndex(player.id)]);

  if (!withoutConnection)
    Network.getPlayers();

  loop();
}

function startGame() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('console').style.display = 'block';

  main();
}