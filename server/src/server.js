#!/usr/bin/env node
// -*- coding: utf-8 -*-
"use strict"

var WebSocketServer = require('websocket').server;
var http = require('http');

var Board = require('./models/board.js');
var Player = require('./models/player.js');
var Crops = require('./models/crops.js');
var Building = require('./models/building.js');
var Utils = require('./utils.js');

var GROWING_TIME = 60; //60 = 1 min
var NATURAL_GROWING_TIME = 600;
var NATURAL_EVENT_TIME = 100;
var CROPS_PRICE_TIME = 600;
var NATURAL_BUILDINGS_POWER_TIME = 300;

var RAIN_RADIUS = 10;
var TORNADO_RADIUS = 3;
var METEOR_RADIUS = 6;
var GRASSHOPPERS_RADIUS = 4;

var FERTILIZE_PRICE = 100;

function Server(port) {

  // HTTP server
  this._server = null;
  // WebSocket server
  this._wsServer = null;
  // port
  this._port = port;

  this._board = new Board();
  this._map = this._board.generate();
  this._players = [];
  this._connections = [];

  this.createServer();

  this._intervalId = null;

  this._growingTime = Date.now();
  this._naturalGrowingTime = Date.now();
  this._naturalEventTime = Date.now();
  this._cropsPriceTime = Date.now();
  this._naturalBuildingsPowerTime = Date.now();

  this._tomatoPrice = 100;
  this._cornPrice = 250;
  this._wheatPrice = 400;

}

/**
 *
 */
Server.prototype.createServer = function() {
  this._server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });

  var port = this._port;
  this._server.listen(this._port, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
  });
}


/**
 *
 */
Server.prototype.runServer = function() {

  var _this = this;

  this.wsServer = new WebSocketServer({ httpServer: this._server, autoAcceptConnections: false });

  this.wsServer.on('request', function(request) {
    _this.onRequest.call(_this, request);
  });

  _this.startLoop();

};

Server.prototype.startLoop = function() {
  
  var _this = this;

  _this._intervalId = setInterval(function() { _this.mainLoop(_this) }, 1000);

};

Server.prototype.mainLoop = function(context) {
  
  var _this = context;

  var currentTime = Date.now();

  _this.updateGame(currentTime);

};

Server.prototype.updateGame = function(delay) {
  
  var _this = this;

  var deltaGrowing = (delay - _this._growingTime) / 1000;

  if (deltaGrowing > GROWING_TIME) {
    
    for (var tX in _this._map) {
      for (var tY in _this._map[tX]) {
        _this._map[tX][tY].growingUpdate();
      }
    }

    _this._growingTime = delay;

    var res = { "response": "update_map", content: _this._map };
    _this.sendAll(res);

  }

  var deltaNaturalGrowing = (delay - _this._naturalGrowingTime) / 1000;

  if (deltaNaturalGrowing > NATURAL_GROWING_TIME) {

    for (var tX in _this._map) {
      for (var tY in _this._map[tX]) {
        _this._map[tX][tY].naturalUpdate();
      }
    }

    _this._naturalGrowingTime = delay;

    var res = { "response": "update_map", content: _this._map };
    _this.sendAll(res);

  }

  var deltaNaturalEvent = (delay - _this._naturalEventTime) / 1000;

  if (deltaNaturalEvent > NATURAL_EVENT_TIME) {
    
    var randEvent = Utils.getRandomInt(0, 10);
    var eventOccur = false;
    var typeEventFunc = null;
    var typeEventName = '';
    var typeEventBehavior = '';

    switch (randEvent) {
      case 0:
        typeEventFunc = _this.doRain;
        typeEventName = 'rain';
        eventOccur = true;
        break;
      case 3:
        typeEventFunc = _this.doTornado;
        typeEventName = 'tornado';
        eventOccur = true;
        break;
      case 6:
        typeEventFunc = _this.doMeteor;
        typeEventName = 'meteor';
        eventOccur = true;
        break;
      case 9:
        typeEventFunc = _this.doGrasshoppers;
        typeEventName = 'grasshoppers';
        eventOccur = true;
        break;
      default:
        eventOccur = false;
        break;
    }

    _this._naturalEventTime = delay;

    if (eventOccur) {

      var path;

      if (Utils.getRandomInt(0, 1) == 0) {
        path = this.naturalLocatedEvent();
        typeEventBehavior = 'located';
      }
      else {
        path = this.naturalMovingEvent();
        typeEventBehavior = 'moving';
      }

      var res = { "response": "natural_event", content: { 'type': typeEventName, 'behavior': typeEventBehavior, 'area': path } };
      _this.sendAll(res);

      for (var i = 0; i < path.length; i++)
        typeEventFunc.call(_this, path[i]);

      var res2 = { "response": "update_map", content: _this._map };
      _this.sendAll(res2);
    }

  }

  var deltaCropsPrice = (delay - _this._cropsPriceTime) / 1000;

  if (deltaCropsPrice > CROPS_PRICE_TIME) {

    _this._tomatoPrice = Utils.getRandomInt(100, 250);
    _this._cornPrice = Utils.getRandomInt(250, 400);
    _this._wheatPrice = Utils.getRandomInt(400, 550);

    _this._cropsPriceTime = delay;

    var res = { "response": "update_crops_price", content: { 'tomato': _this._tomatoPrice, 'corn': _this._cornPrice, 'wheat': _this._wheatPrice } };
    _this.sendAll(res);

  }

  var deltanaturalBuildingsPower = (delay - _this._naturalBuildingsPowerTime) / 1000;

  if (deltanaturalBuildingsPower > NATURAL_BUILDINGS_POWER_TIME) {

    for (var tX in _this._map) {
      for (var tY in _this._map[tX]) {
        _this._map[tX][tY].worksUpdate(this._players, NATURAL_BUILDINGS_POWER_TIME);
      }
    }

    _this._naturalBuildingsPowerTime = delay;

    var res = { "response": "update_map", content: _this._map };
    _this.sendAll(res);

    var res2 = { "response": "players_update", content: _this._players };
    _this.sendAll(res2);

  }

};

Server.prototype.doRain = function(tile) {

  //RAIN
  tile.watering();

};

Server.prototype.doTornado = function(tile) {

  //TORNADO
  tile.destroyEverything();

};


Server.prototype.doMeteor = function(tile) {

  //METEOR
  tile.destroyEverything();

};


Server.prototype.doGrasshoppers = function(tile) {

  //GRASSHOPPERS
  tile.destroyCrops();

};

Server.prototype.naturalLocatedEvent = function() {

  var _this = this;

  var area = new Array();

  var l_center_x = Utils.getRandomInt(0, this._board.width - 1), l_center_y = Utils.getRandomInt(0, this._board.height - 1);
  var l_width = Utils.getRandomInt(0, 15), l_height = Utils.getRandomInt(0, 15);

  for (var l_x = l_center_x - Math.floor(l_width / 2); l_x <= l_center_x + Math.floor(l_width /2 ); l_x++)
    for (var l_y = l_center_y - Math.floor(l_height / 2); l_y <= l_center_y + Math.floor(l_height /2 ); l_y++)
      if (l_x >= 0 && l_x < this._board.width && l_y >= 0 && l_y < this._board.height) {
        area.push(_this._map[l_x][l_y]);
      }

  return area;

};

Server.prototype.naturalMovingEvent = function() {

  var _this = this;

  /*var path = new Array();

  var startTile = { x: Utils.getRandomInt(0, this._board.width - 1), y: Utils.getRandomInt(0, this._board.height - 1) };
  var endTile = { x: Utils.getRandomInt(0, this._board.width - 1), y: Utils.getRandomInt(0, this._board.height - 1) };

  var x = startTile.x, y = startTile.y;

  var i_x = (startTile.x > endTile.x) ? -1 : 1;
  var i_y = (startTile.y > endTile.y) ? -1 : 1;

  while (x != endTile.x && y != endTile.y) {
    path.push(_this._map[i][y]);
  }*/

  //return path; this algorithm is not ready
  return [_this._map[0][1], _this._map[0][2], _this._map[0][3], _this._map[0][4], _this._map[0][5]];

};

/**
 *
 */
Server.prototype.onRequest = function(request) {

  var _this = this;

  var context = {
    player_id: -1,
    connection: request.accept('', request.origin)
  };

  var connection = context.connection;
  _this._connections.push(connection);

  console.log((new Date()) + ' Connection accepted.');

  connection.on('message', function(msg) {
    _this.onMessage.call(_this, msg, context);
  });

  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');

    if (context.player_id == -1)
      return;

    _this._players[context.player_id].connected = false;

    var msg = { "response": "chat", "content": _this._players[context.player_id].username + " is disconnected !" };
    _this.sendAll(msg);
  });

};

/**
 *
 */
Server.prototype.onMessage = function(message, context) {

  var _this = this;
  var connection = context.connection;
  var player_id = context.player_id;

  var msg = JSON.parse(message['utf8Data']);

  var funcs = {
    create: _this.createProcess,
    login: _this.loginProcess,
    map: _this.mapProcess,
    chat: _this.chatProcess,
    update_player: _this.updatePlayerProcess,
    get_players: _this.getPlayersProcess,
    attack_tile: _this.attackTile,
    plant_process: _this.plantCropsProcess,
    build_process: _this.buildBuildingProcess,
    watering: _this.watering,
    fertilizing: _this.fertilizing,
    harvesting: _this.harvesting,
    selling_harvest: _this.sellingHarvest,
    store_harvest: _this.storeHarvest
  };

  if (funcs[msg.request] == undefined) {
    // error
    return;
  }

  funcs[msg.request].call(_this, context, msg);
};


/**
 *
 */
Server.prototype.createProcess = function(context, msg) {

  var _this = this;

  var found = false, status = "success";
  // look for password
  for (var p in _this._players) {
    if (_this._players[p].username == msg.content.username) {
      found = true;
    }
  }

  if (!found) {
    var p = new Player();
    p.username = msg.content.username;
    p.password = msg.content.password;      
    p.id = _this._players.push(p) - 1;
    p.generatePositionsFromOthers(_this._board, _this._map, _this._players);
    switch (msg.content.level) {
      case "medium":
        p.money /= 2;
      break;
      case "hard":
        p.money /= 10;
      break;
    }
    status = "created";
  } else {
    status = "already";
  }

  _this.send(context.connection, "create", status)
};

/**
 *
 */
Server.prototype.loginProcess = function(context, msg) {

  var _this = this;

  var status = "failed", found = false;

  // look for password
  for (var p in _this._players) {
    if (_this._players[p].username == msg.content.username) {
      found = true;

      if (_this._players[p].connected) {
        status = "already";
        break;
      }

      if (_this._players[p].password == msg.content.password) {
        status = "success";
        _this._players[p].connected = true;
        context.player_id = _this._players[p].id;
      }
    }
  }

  // 
  if (!found) {
    status = "error";
  }

  var res = { status: status };

  if (status == "success") {
    var msg = { "response": "chat", "content": "* "+ _this._players[context.player_id].username + " is connected !" };
    
    _this.sendAll(msg);

    res.player = _this._players[context.player_id];
    res.cropsPrice = { 'tomato': _this._tomatoPrice, 'corn': _this._cornPrice, 'wheat': _this._wheatPrice };
  }

  _this.send(context.connection, "login", res);
};

/**
 *
 */
Server.prototype.mapProcess = function(context, msg) {
  var _this = this;

  //console.log(_this._map[0][0]);

  _this.send(context.connection, "map", _this._map);
};

/**
 *
 */
Server.prototype.chatProcess = function(context, msg) {
  var _this = this;

  if (msg.content.id == undefined || (msg.content.id < 0 && msg.content.id >= _this._players.length))
    return;

  var username = _this._players[msg.content.id].username;
  var res = { "response": "chat", content: '<'+ username +'> '+ msg.content.message };

  _this.sendAll(res);
};

/**
 *
 */
Server.prototype.getPlayersProcess = function(context, msg) {
  var _this = this;

  var res = { "response": "players", content: _this._players };
  _this.sendAll(res);
};

/**
 *
 */
Server.prototype.updatePlayerProcess = function(context, msg) {
  var _this = this;

  if (msg.content.id == undefined || (msg.content.id < 0 && msg.content.id >= _this._players.length))
    return;

  _this._players[msg.content.id].position.x = msg.content.position.x;
  _this._players[msg.content.id].position.y = msg.content.position.y;

  var res = { "response": "players", content: _this._players };
  _this.sendAll(res);
};

Server.prototype.attackTile = function(context, msg) {
  var _this = this;

  if (msg.content.id == undefined || (msg.content.id < 0 && msg.content.id >= _this._players.length))
    return;

  var x = msg.content.tile_position.x, y = msg.content.tile_position.y,
      userid = msg.content.id;

  var result = _this._players[userid].attackTile(_this._map[x][y]);
  if (result.type == "tile" && result.ok) {
    var res = { "response": "tile_owner", content: _this._map[x][y] };
    _this.sendAll(res);

    _this.updateCurrentPlayer(context, msg);
  }
  if (result.type == "max_tile") {
    _this.sendError(context, "You can only attack " + _this._players[userid].getNumberOfMaxTileAtTime() + " tile(s) at time !")
  }
};

Server.prototype.updateCurrentPlayer = function(context, msg) {
  var _this = this;

  if (msg.content.id == undefined || (msg.content.id < 0 && msg.content.id >= _this._players.length))
    return;

  var userid = msg.content.id;

  _this.send(context.connection, "update_current_player", _this._players[userid]);
};

/**
 *
 */
Server.prototype.plantCropsProcess = function(context, msg) {
  var _this = this;

  var x = msg.content.tile_position.x, y = msg.content.tile_position.y,
      type = msg.content.type, userid = msg.content.id;

  var c = new Crops();
  c.create(type);
  c.owner = userid;

  if (_this._players[userid].money >= c.price) {
    _this._map[x][y].content = c;
    _this._players[userid].money -= c.price;

    var res = { "response": "update_tile_content", content: _this._map[x][y] };
    _this.sendAll(res);

    _this.updateCurrentPlayer(context, msg);
  }
  else {
    _this.sendError(context, "You need more money to plant this crop !");
  }
};

Server.prototype.buildBuildingProcess = function(context, msg) {
  var _this = this;

  var x = msg.content.tile_position.x, y = msg.content.tile_position.y,
      type = msg.content.type, userid = msg.content.id;

  var b = new Building();
  b.create(type);
  b.owner = userid;

  if (_this._players[userid].money >= b.price) {
    _this._map[x][y].content = b;
    _this._players[userid].money -= b.price;

    var res = { "response": "update_tile_content", content: _this._map[x][y] };
    _this.sendAll(res);

    _this.updateCurrentPlayer(context, msg);
  }
  else {
    _this.sendError(context, "You need more money to build this building !");
  }
};

Server.prototype.watering = function(context, msg) {
  var _this = this;

  var x = msg.content.tile_position.x, y = msg.content.tile_position.y,
      userid = msg.content.id;

  if (_this._map[x][y].content == null || Object.getPrototypeOf(_this._map[x][y].content) == Crops.prototype) {
    if (_this._map[x][y].watering()) {
      var res = { "response": "update_tile_hum_fert", content: _this._map[x][y] };
      _this.sendAll(res);
    }
  }
  
};

Server.prototype.fertilizing = function(context, msg) {
  var _this = this;

  var x = msg.content.tile_position.x, y = msg.content.tile_position.y,
      userid = msg.content.id;

  if (_this._map[x][y].content == null || Object.getPrototypeOf(_this._map[x][y].content) == Crops.prototype) {
    if (_this._players[userid].money >= FERTILIZE_PRICE) {
      if (_this._map[x][y].fertilizing()) {
        
        _this._players[userid].money -= FERTILIZE_PRICE;

        var res = { "response": "update_tile_hum_fert", content: _this._map[x][y] };
        _this.sendAll(res);

        _this.updateCurrentPlayer(context, msg);
      }
    }
    else {
      _this.sendError(context, "You need more money to fertilize this land !");
    }
  }
};

Server.prototype.harvesting = function(context, msg) {
  var _this = this;

  var x = msg.content.tile_position.x, y = msg.content.tile_position.y,
      userid = msg.content.id;

  if (Object.getPrototypeOf(_this._map[x][y].content) == Crops.prototype) {
    if (_this._map[x][y].content.maturation >= 80) {
      if (_this._players[userid].cropsCurrentlyHarvested == null) {
        
        _this._players[userid].cropsCurrentlyHarvested = _this._map[x][y].content;
        _this._map[x][y].content = null;

        var res = { "response": "update_tile_content", content: _this._map[x][y] };
        _this.sendAll(res);

        _this.updateCurrentPlayer(context, msg);
      }
      else {
        _this.sendError(context, "You cart is full, you have to empty it.");
      }
    }
    else {
      _this.sendError(context, "This crop maturity is not good enough.");
    }
  }
  else {
    _this.sendError(context, "This land cannot be harvested.");
  }
};

Server.prototype.sellingHarvest = function(context, msg) {
  var _this = this;

  var userid = msg.content.id;

  if (_this._players[userid].cropsCurrentlyHarvested) {
    var cropsPrice = 0;
    switch (_this._players[userid].cropsCurrentlyHarvested.type) {
      case 'tomato':
        cropsPrice = _this._tomatoPrice;
        break;
      case 'corn':
        cropsPrice = _this._cornPrice;
        break;
      case 'wheat':
        cropsPrice = _this._wheatPrice;
        break;
      default:
        break;
    }

    _this._players[userid].money += _this._players[userid].cropsCurrentlyHarvested.productivity * cropsPrice;
    _this._players[userid].cropsCurrentlyHarvested = null;

    _this.updateCurrentPlayer(context, msg);
  }
  else {
    _this.sendError(context, "There is no harvest to sell.");
  }
  
};

Server.prototype.storeHarvest = function(context, msg) {
  var _this = this;

  var x = msg.content.tile_position.x, y = msg.content.tile_position.y,
      userid = msg.content.id;

  if (Object.getPrototypeOf(_this._map[x][y].content) == Building.prototype && _this._map[x][y].content.owner == userid) {

    var result = _this._map[x][y].content.store(_this._players[userid].cropsCurrentlyHarvested);

    if (result == 'done') {
      _this._players[userid].cropsCurrentlyHarvested = null;

      var res = { "response": "update_tile_content", content: _this._map[x][y] };
      _this.sendAll(res);

      _this.updateCurrentPlayer(context, msg);
    }
    else {
      _this.sendError(context, result);
    }
  }
  else {
    _this.sendError(context, "This is not an available place to store your harvest !!!");
  }
  
};

Server.prototype.sendError = function(context, msg) {
  var _this = this;
  _this.send(context.connection, "error", msg);
};

/**
 *
 */
Server.prototype.send = function(connection, res, content) {
  var res = { "response": res, content: content };
  connection.sendUTF(JSON.stringify(res));
};

/**
 *
 */
Server.prototype.sendAll = function(msg) {
  for (var c in this._connections) {
    if (this._connections[c].connected) {
      this._connections[c].sendUTF(JSON.stringify(msg));
    }
  }
};



module.exports = Server;
