/**
 *
 *
 */

var Utils = require('../utils.js');

var RADIUS = 8;
var TILES_FOR_LEVEL = 10;
var MAX_TILE_AT_TIME = 2;

var Player = function() {
	
  this.id = -1;

  this.username = "";
  this.password = "";

  this.entryLevel = -1;

  this.level = 0;
  this.numberOfTilesOwned = 0;
  this.numberOfAttackingTile = 0;

  this.money = 100000;
  this.isAdmin = false;
  this.connected = false;

  this.position = { x: 0, y: 0 };
  this.initPosition = { x: 0, y: 0};

  this.cropsCurrentlyHarvested = null;

};

Player.prototype.init = function(username, password) {
  this.username = username;
  this.password = password;
};

Player.prototype.generatePositionsFromOthers = function(board, map, players) {
  var width = board.width,
      height = board.height,
      computing = true;

  while(computing) {
    var x, y;

    while(true) {
      x = Utils.getRandomInt(0, width - 1);
      y = Utils.getRandomInt(0, height - 1);

      if (map[x][y].canWalkOn)
        break;
    }

    if(players.length == 0) {
      this.initPosition = {x: x, y: y};
      this.position = this.initPosition;
      break;
    }

    for(var p in players) {
      //console.log(players[p]);
      if(Math.abs(players[p].position.x - x) > RADIUS
        && Math.abs(players[p].position.y - y) > RADIUS) {
        this.initPosition = {x: x, y: y};
        this.position = this.initPosition;
        computing = false;
        break;  
      }
      else
        break;
    }
  }

  //console.log(this.position);

};

Player.prototype.attackTile = function(tile) {
  if (this.numberOfAttackingTile >= MAX_TILE_AT_TIME * this.level) {
    if (tile.ownedById == null && tile.type != 'water') {
      this.numberOfAttackingTile++;
      tile.ownedById = this.id;
      tile.ownedByName = this.username;
      this.addOneOwnedTile();
      return { ok: true, type: "tile" };
    }
    else {
      return { ok: false, type: "tile" };
    }
  }
  return { ok: false, type: "max_tile" };
};

Player.prototype.addOneOwnedTile = function() {
  this.numberOfTilesOwned++;
  this.numberOfAttackingTile--;
  this.calculateLevelFromOwnedTiles();
};

Player.prototype.removeOneOwnedTile = function() {
  this.numberOfTilesOwned--;
  this.calculateLevelFromOwnedTiles();
};

Player.prototype.calculateLevelFromOwnedTiles = function() {
  if (this.numberOfTilesOwned >= TILES_FOR_LEVEL) {
    this.level = (this.numberOfTilesOwned - (this.numberOfTilesOwned % TILES_FOR_LEVEL)) / TILES_FOR_LEVEL;
  }
};

Player.prototype.getNumberOfMaxTileAtTime = function(tile) {
  return MAX_TILE_AT_TIME * this.level;
};


module.exports = Player;