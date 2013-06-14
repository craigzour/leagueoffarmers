/**
 *
 *
 */

var Tile = require('./tile.js'),
    Utils = require('../utils.js');

var WIDTH = HEIGHT = 50

var Board = function() {

  this.id = "";

  this.width = WIDTH;
  this.height = HEIGHT;

  this.humidity = -1;
  this.fertility = -2;

};

Board.prototype.generate = function() {
  var board = new Array(this.width);


  for (var i = 0; i < this.width; ++i) {
    board[i] = new Array(this.height);

     var bandRange = Utils.getRandomInt(0, 9);

    for (var j = 0; j < this.height; ++j) {

      var t = new Tile();
      t.position.x = i;
      t.position.y = j;
      t.type = 'grass';

      t.fertility = Utils.getRandomInt(bandRange * 10, bandRange * 10 + 10);
      t.humidity = Utils.getRandomInt(0, 100);

      board[i][j] = t;
    }
  }

  // GENERATE LAKES
  var nb_lake = Utils.getRandomInt(3, 10);

  //console.log(nb_lake + ' lakes')

  for (var n = 0; n < nb_lake; ++n) {

    var l_center_x = Utils.getRandomInt(0, WIDTH - 1), l_center_y = Utils.getRandomInt(0, HEIGHT - 1);
    var l_width = Utils.getRandomInt(0, 15), l_height = Utils.getRandomInt(0, 15);

    for (var l_x = l_center_x - Math.floor(l_width / 2); l_x <= l_center_x + Math.floor(l_width /2 ); l_x++)
      for (var l_y = l_center_y - Math.floor(l_height / 2); l_y <= l_center_y + Math.floor(l_height /2 ); l_y++)
        if (l_x >= 0 && l_x < WIDTH && l_y >= 0 && l_y < HEIGHT) {
          board[l_x][l_y].type = 'water';
          board[l_x][l_y].canWalkOn = false;
        }
  }

  return board;
}


module.exports = Board;