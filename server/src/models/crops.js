/**
 *
 *
 */

var Utils = require('../utils.js');

var Crops = function() {

  this.contentType = 'crops';
  this.type = '';
  this.growRate = 0;
  this.decayTime = 0;
  this.productivity = 0;
  this.storability = 0;
  this.price = 0;
  this.health = 100;
  this.maturation = 0;

  this.maturationEnded = false;
  this.decayTimeEnded = false;

  this.owner = -1;

	this.crops = {

    'tomato': {
      growRate: 6, // 6% / 60 sec
      decayTime: 300, // in seconde
      productivityMax: 3,
      storability: 2,
      price: 20
    },

    'corn': {
      growRate: 4,
      decayTime: 1000,
      productivityMax: 5,
      storability: 2,
      price: 40
    },

    'wheat': {
      growRate: 3,
      decayTime: 1500,
      productivityMax: 5,
      storability: 2,
      price: 40
    }

  };

};

Crops.prototype.create = function(c) {

  this.type = c;
  this.growRate = this.crops[c].growRate;
  this.decayTime = this.crops[c].decayTime;
  this.productivity = Utils.getRandomInt(1, this.crops[c].productivityMax);
  this.storability = this.crops[c].storability;
  this.price = this.crops[c].price;

};

Crops.prototype.grow = function(tile) {

  if (tile.fertility >= 10 && tile.humidity >= 10 && !this.maturationEnded) {
    
    //update maturity
    if (this.maturation < 100) {
      this.maturation += this.growRate;
    }

    if (this.maturation > 100) {
      this.maturation = 100;
      this.maturationEnded = true;
    }

    //decrease tile's fertility and humidity
    tile.fertility -= 10;
    tile.humidity -= 10;

    //verification
    if (tile.fertility < 10)
      tile.fertility = 0;
    if (tile.humidity < 10)
      tile.humidity = 0;
  
    //update health
    this.health = Math.round((tile.fertility * tile.humidity) / 100);
  }
  
};

module.exports = Crops;