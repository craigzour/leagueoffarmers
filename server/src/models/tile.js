/**
 *
 *
 */

var Crops = require('./crops.js');
var Building = require('./building.js');


var Tile = function() {
  
  this.position = { x: 0, y: 0 };

  this.fertility = 0;  
  this.humidity = 0;

  this._types = ['grass', 'crop', 'water', 'tree'];
  this.type = 'grass'; // default

  this.content = null;

  this.ownedById = null;
  this.ownedByName = 'nobody';
  this.canWalkOn = true;

};

Tile.prototype.growingUpdate = function() {

	if (this.content != null && Object.getPrototypeOf(this.content) === Crops.prototype) {

		this.content.grow(this);

	}

};

Tile.prototype.worksUpdate = function(player, time) {

	if (this.content != null && Object.getPrototypeOf(this.content) === Building.prototype) {

		this.content.works(player, time);

	}

};

Tile.prototype.naturalUpdate = function() {

	if (this.content == null) {
		this.fertilizing();
	}

};

Tile.prototype.watering = function() {
	if (this.humidity < 90) {
		this.humidity += 10;
		return true;
	}
	return false;
};

Tile.prototype.fertilizing = function() {
	if (this.fertility < 90) {
		this.fertility += 10;
		return true;
	}
	return false;
};

Tile.prototype.destroyEverything = function() {
	this.content = null;
};

Tile.prototype.destroyCrops = function() {
	if (this.content != null && Object.getPrototypeOf(this.content) === Crops.prototype) {
		this.content = null;
	}
};

module.exports = Tile;
