/**
 *
 *
 */

var POWER_COST = 2;
var WORKING_COST = 100;

var Building = function() {

  this.contentType = 'building';
  this.type = ''
  this.tile = 0;
  this.contain = 0;
  this.power = 0;
  this.price = 0;

  this.actualPower = 0;
  this.actualContainingLevel = 0;
  this.actualContainingItems = new Array();

  this.owner = -1;

	this.buildings = {

    'silo': {
      tile: 1,
      contain: 20,
      power: 50, 
      price: 2000
    },

    'barn': {
      tile: 4,
      contain: 50,
      power: 80,
      price: 5000
    },

    'cold_storage': {
      tile: 6,
      contain: 150,
      power: 150,
      price: 10000
    }

  };

};

Building.prototype.create = function(b) {

  this.type = b;
  this.tile = this.buildings[b].tile;
  this.contain = this.buildings[b].contain;
  this.power = this.buildings[b].power;
  this.price = this.buildings[b].price;

  this.actualPower = this.power;

};

Building.prototype.works = function(player, time) {

  if (this.actualPower > 0) {
    switch (this.type) {
      case 'silo':
        this.actualPower -= POWER_COST;
        break;
      case 'barn':
        this.actualPower -= POWER_COST;
        break;
      case 'cold_storage':
        if (this.actualContainingLevel > 0) {
          this.actualPower -= POWER_COST;
          player[this.owner].money -= WORKING_COST;
        }
        break;
      default:
        this.actualPower -= POWER_COST;
        break;
    }
  }

  if (this.actualContainingLevel > 0 && this.type != 'cold_storage') {
    console.log(this.actualContainingItems);
    for (var i = 0; i < this.actualContainingItems.length; i++) {
      if (!this.actualContainingItems[i].decayTimeEnded) {
        if (this.actualContainingItems[i].decayTime > 0) {
          this.actualContainingItems[i].decayTime -= time;
          continue;
        }
        else {
          this.actualContainingItems[i].maturation -= 10;
        }

        if (this.actualContainingItems[i].maturation <= 0) {
          this.actualContainingLevel -= this.actualContainingItems[i].productivity;
          this.actualContainingItems[i].decayTimeEnded = true;
        }
      }
    }
  }

  if (this.actualContainingLevel <= 0) {
    this.actualContainingItems = new Array();
  }
  
};

Building.prototype.store = function(harvest) {

  if (this.actualPower > 0) {
    if (this.actualContainingLevel + harvest.productivity <= this.contain) {
      this.actualContainingItems.push(harvest);
      this.actualContainingLevel += harvest.productivity;
      return 'done';
    }
    else {
      return 'This facility is full.';
    }
  }
  else {
    return 'This facility is no longer available.';
  }
  
};

module.exports = Building;
