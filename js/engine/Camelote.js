"use strict"

/*******************
 *                 *
 * CAMELOTE ENGINE *
 *                 *
 *******************/

/*
 *
 * CAMELOTE CLASS
 *
 */

var TILE_W, TILE_H;

function Camelote(tileWidth, tileHeight) {
  this.canvas = null, this.canvasContext = null;

  TILE_W = tileWidth || 128;
  TILE_H = tileHeight || 64;

  this.imageResources = {};

  this.map = [];

  this.mousePositionX = 0, this.mousePositionY = 0;
  this.mouseOnCanvas = false;
  this.userCanMoveMap = true;
  this.entityToFollow = null;

  this.globalOffsetX = 0, this.globalOffsetY = 0;

  this.globalScaleX = 1, this.globalScaleY = 1;

  this.hoverTile = null;

  this.hud = new Hud(10, 10, 300, 600);

  this.naturalEvent = null;
  this.naturalEventStartTime = Date.now();
  this.definedNaturalEventTime = 10;
}

Camelote.prototype = {

  /*
   *
   * "PUBLIC METHODS"
   *
   */

  start: function () {
    // Create Canvas element
    this.canvas = document.createElement('canvas');

    // Add Canvas element to <body>
    document.body.appendChild(this.canvas);

    // Try if Canvas is supported by user's browser
    if (this.canvas.getContext) {
      this.canvasContext = this.canvas.getContext('2d');

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Deactivate context menu from right click
      this.canvas.setAttribute('onselectstart', 'return false');
      this.canvas.setAttribute('oncontextmenu', 'return false');

      // Link events to functions
      var _this = this;

      this.canvas.addEventListener('mousemove', function () {
        _this.updateMousePosition();
      }, false);

      document.body.addEventListener('mouseover', function () {
        _this.setMouseOnCanvas(true);
      }, false);

      document.body.addEventListener('mouseout', function () {
        _this.setMouseOnCanvas(false);
      }, false);

    }
    else {
      alert('Sorry, Canvas feature is not supported by your browser !');
    }
  },

  update: function (delay) {
    this.moveMap(0);
    this.hoverTile = this.getTileByMousePositions();
    this.hud.update(this.hoverTile);

    if (this.naturalEvent) {
      this.naturalEvent.update(delay);

      var delta = delay - this.naturalEventStartTime;
      if ((delta / 1000) > this.definedNaturalEventTime) {
        this.naturalEvent = null;
      }
    }
  },

  draw: function () {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var x = 0; x < this.map.length; x++) {
      for (var y = 0; y < this.map[x].length; y++) {
        this.map[x][y].draw(this.getCanvasContext(), this.getGlobalOffsetX(), this.getGlobalOffsetY());
      }
    }

    if (this.naturalEvent)
      this.naturalEvent.draw(this.getCanvasContext(), this.getGlobalOffsetX(), this.getGlobalOffsetY(), this.getMap());

    if (this.hoverTile) {
      this.hoverTile.drawHover(this.getCanvasContext(), this.getGlobalOffsetX(), this.getGlobalOffsetY());
    }

    this.hud.draw(this.getCanvasContext());
  },

  loadJsonMap: function (mapJson) {
    var centerX = this.canvas.width / 2;

    //var mapData = JSON.parse(mapJson);
    var mapData = mapJson;

    var tileImg = null;
    var canWalkOn = false;

    for (var x = 0; x < mapData.content.length; x++) {

      this.map[x] = new Array();

      for (var y = 0; y < mapData.content[x].length; y++) {

        if (mapData.content[x][y].type == 'grass') {
          if (mapData.content[x][y].fertility > 50) {
            tileImg = this.getImageResources('grass');
            canWalkOn = true;
          }
          else {
            tileImg = this.getImageResources('grass');
            canWalkOn = true;
          }
        }
        else if (mapData.content[x][y].type == 'water') {
          tileImg = this.getImageResources('water');
          canWalkOn = false;
        }
        else {
          tileImg = this.getImageResources('grass');
          canWalkOn = true;
        }

        /*if (mapData.content[x][y].content != null)
          canWalkOn = false;*/

        this.map[x][y] = new Tile(
          x,
          y,
          (centerX - TILE_W / 2) + (y * -TILE_W / 2) + x * (TILE_W / 2 /*+ 1*/),
          (x + y) * (TILE_W / 2 / 2),
          TILE_W,
          TILE_H,
          tileImg,
          canWalkOn,
          mapData.content[x][y].fertility,
          mapData.content[x][y].humidity,
          mapData.content[x][y].ownedById,
          mapData.content[x][y].ownedByName,
          mapData.content[x][y].content
        );
      }
    }
  },

  doNaturalEvent: function(eventType, eventBehavior, eventArea) {
    this.naturalEvent = new NaturalEvent(eventType, eventBehavior, eventArea);
    this.naturalEvent.initialize();
    this.naturalEventStartTime = Date.now();
  },

  updateMap: function(map) {
    for (var x = 0; x < map.length; x++) {
      for (var y = 0; y < map[x].length; y++) {
        this.map[x][y].content = map[x][y].content;
        this.map[x][y].humidity = map[x][y].humidity;
        this.map[x][y].fertility = map[x][y].fertility;
      }
    }
  },

  updateTileOwner: function (tileX, tileY, ownerId, ownerName) {
    this.map[tileX][tileY].setOwnerId(ownerId);
    this.map[tileX][tileY].setOwnerName(ownerName);
  },

  updateTileContent: function (tile) {
    this.map[tile.position.x][tile.position.y].content = tile.content;

    /*if (this.map[tile.position.x][tile.position.y].content != null) {
      this.map[tile.position.x][tile.position.y].setCanWalkOn(false);
    }
    else {
      this.map[tile.position.x][tile.position.y].setCanWalkOn(true);
    }*/
  },

  updateTileHumidityAndFertility: function (tile) {
    this.map[tile.position.x][tile.position.y].humidity = tile.humidity;
    this.map[tile.position.x][tile.position.y].fertility = tile.fertility;
  },

  loadImage: function (name, path) {
    var img = new Image();
    img.src = path;

    this.imageResources[name] = img;
  },

  getTileByMousePositions: function () {
    for (var x = 0; x < this.map.length; x++) {
      for (var y = 0; y < this.map[x].length; y++) {
        if (this.mousePositionX > this.map[x][y].getPosX() + this.globalOffsetX &&
          this.mousePositionX < this.map[x][y].getPosX() + this.globalOffsetX + this.map[x][y].getWidth() &&
          this.mousePositionY > this.map[x][y].getPosY() + this.globalOffsetY &&
          this.mousePositionY < this.map[x][y].getPosY() + this.globalOffsetY + this.map[x][y].getHeight())
          return this.map[x][y];
      }
    }
    return null;
  },

  isFarmerNearTile: function (farmer, tile) {
    if (farmer.getCurrentTile() == tile) {
      return false;
    }
    if (Math.abs(farmer.getCurrentTile().getX() - tile.getX()) == 1 ||Math.abs(farmer.getCurrentTile().getX() - tile.getX()) == 0) {
      if (Math.abs(farmer.getCurrentTile().getY() - tile.getY()) == 1 || Math.abs(farmer.getCurrentTile().getY() - tile.getY()) == 0) {
        return true;
      }
    }
    return false;
  },

  zoomIn: function () {
    this.globalScaleX += 1;
    this.globalScaleY += 1;

    // To review
    this.canvasContext.save();
    this.canvasContext.scale(this.globalScaleX, this.globalScaleY);
  },

  zoomOut: function () {
    this.globalScaleX -= 1;
    this.globalScaleY -= 1;

    if (this.globalScaleX < 1)
      this.globalScaleX = this.globalScaleY = 1;

    this.canvasContext.scale(this.globalScaleX, this.globalScaleY);
    // To review
    this.canvasContext.restore();
  },

  moveMap: function (entity) {
    if (entity != 0 && entity != -1 && this.entityToFollow == null)
      this.entityToFollow = entity;
    else if (entity == -1)
      this.entityToFollow = null;

    if (this.userCanMoveMap) {
      if (this.mouseOnCanvas) {
        if (this.mousePositionX > this.canvas.width - 50)
          this.globalOffsetX -= 20;

        if (this.mousePositionX < 50)
          this.globalOffsetX += 20;

        if (this.mousePositionY < 50)
          this.globalOffsetY += 20;

        if (this.mousePositionY > this.canvas.height - 50)
          this.globalOffsetY -= 20;

        //console.log("MoveMap", this.mousePositionX, this.mousePositionY);
      }
    }
    else {
      var tile = this.entityToFollow.getCurrentTile();
      if ((tile.getPosX() + (tile.getWidth() / 2) + this.globalOffsetX) > ((this.canvas.width / 2) + (tile.getWidth() / 2)))
        this.globalOffsetX -= 5;

      if ((tile.getPosX() + (tile.getWidth() / 2) + this.globalOffsetX) < ((this.canvas.width / 2) - (tile.getWidth() / 2)))
        this.globalOffsetX += 5;

      if ((tile.getPosY() + (tile.getHeight() / 2) + this.globalOffsetY) > ((this.canvas.height / 2) + (tile.getHeight() / 2)))
        this.globalOffsetY -= 5;

      if ((tile.getPosY() + (tile.getHeight() / 2) + this.globalOffsetY) < ((this.canvas.height / 2) + (tile.getHeight() / 2)))
        this.globalOffsetY += 5;
      /*this.globalOffsetX -= (tile.getPosX() + (tile.getWidth() / 2) + this.globalOffsetX) - ((this.canvas.width / 2) + (tile.getWidth() / 2));
      this.globalOffsetY -= (tile.getPosY() + (tile.getHeight() / 2) + this.globalOffsetY) - ((this.canvas.height / 2) + (tile.getHeight() / 2));*/
    }
  },

  moveMapOnUser: function(entity) {
    if (!entity.getIsMoving()) {
      var tile = entity.getCurrentTile();
      this.globalOffsetX -= (tile.getPosX() + (tile.getWidth() / 2) + this.globalOffsetX) - ((this.canvas.width / 2) + (tile.getWidth() / 2));
      this.globalOffsetY -= (tile.getPosY() + (tile.getHeight() / 2) + this.globalOffsetY) - ((this.canvas.height / 2) + (tile.getHeight() / 2));
    }
  },

  setUserCanMoveMap: function (b) {
    this.userCanMoveMap = b;
  },

  getHud: function(){
    return this.hud;
  },

  getImageResources: function (name) {
    return this.imageResources[name];
  },

  /*
   *
   * "PRIVATE METHODS"
   *
   */

  updateMousePosition: function () {
    var _this = this;
    if (window.event) {
      _this.mousePositionX = window.event.clientX;
      _this.mousePositionY = window.event.clientY;
      //console.log("updateMousePosition", _this.mousePositionX, _this.mousePositionY, _this);
    }
  },

  setMouseOnCanvas: function (b) {
    var _this = this;
    _this.mouseOnCanvas = b;
    //console.log(_this.mouseOnCanvas);
  },

  getCanvas: function () {
    return this.canvas;
  },

  getCanvasContext: function () {
    return this.canvasContext;
  },

  getMap: function () {
    return this.map;
  },

  getGlobalOffsetX: function () {
    return this.globalOffsetX;
  },

  getGlobalOffsetY: function () {
    return this.globalOffsetY;
  }

};

/*
 *
 * NATURALEVENT CLASS
 *
 */

function NaturalEvent(eventType, eventBehavior, eventArea) {
  this.eventType = eventType;
  this.eventBehavior = eventBehavior;
  this.eventArea = eventArea;

  this.img = null;

  this.animationTime = Date.now();
  this.definedAnimationTime = 0.20;
  this.animHeight = 200;
}

NaturalEvent.prototype = {

  initialize: function() {
    switch (this.eventType) {
      case 'rain':
        this.img = CameloteEngine.getImageResources('rain');
        break;
      case 'tornado':
        this.img = CameloteEngine.getImageResources('rain')
        break;
      case 'meteor':
        this.img = CameloteEngine.getImageResources('rain')
        break;
      case 'grasshoppers':
        this.img = CameloteEngine.getImageResources('rain')
        break;
      default:
        this.img = CameloteEngine.getImageResources('rain')
        break;
    }
  },

  update: function(delay) {
    var delta = delay - this.animationTime;
    if ((delta / 1000) > this.definedAnimationTime) {

      if (this.animHeight == 200) {
        this.animHeight = 220;
      }
      else {
        this.animHeight = 200;
      }

      this.animationTime = delay;
    }
  },

  draw: function(ctx, offsetX, offsetY, map) {
    for (var i = 0; i < this.eventArea.length; i++) {
      ctx.drawImage(this.img,
                    offsetX + (map[this.eventArea[i].position.x][this.eventArea[i].position.y].getPosX() + 40),
                    offsetY + (map[this.eventArea[i].position.x][this.eventArea[i].position.y].getPosY() - 100),
                    120,
                    this.animHeight);
    }
  }

};

/*
 *
 * HUD CLASS
 *
 */

function Hud(posX, posY, width, height) {
  this.posX = posX;
  this.posY = posY;
  this.width = width;
  this.height = height;

  this.player = null;
  this.tile = null;
}

Hud.prototype = {

  /*
   *
   * "PUBLIC METHODS"
   *
   */

  update: function(tile) {
    this.tile = tile;
  },

  draw: function(ctx) {
    ctx.beginPath();
    ctx.rect(this.posX, this.posY, this.width, this.height);
    ctx.fillStyle = 'grey';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.font = "12px Arial";
    ctx.fillStyle = 'black';

    var x = 0, y = 0, fertility = 0, humidity = 0, ownerName = '';
    if (this.tile) {
      x = this.tile.getX();
      y = this.tile.getY();
      fertility = this.tile.getFertility();
      humidity = this.tile.getHumidity();
      ownerName = this.tile.getOwnerName();
    }

    ctx.fillText("X : " + x, 20, 30);
    ctx.fillText("Y : " + y, 20, 50);
    ctx.fillText("Owned by : " + ownerName, 20, 70);
    ctx.fillText("Fertility : " + fertility, 20, 90);
    ctx.fillText("Humidity : " + humidity, 20, 110);

    if (this.tile && this.tile.content && this.tile.content.contentType == 'crops') {
      ctx.fillText("Maturity : " + this.tile.content.maturation + " / 100", 20, 130);
      ctx.fillText("Health : " + this.tile.content.health + " / 100", 20, 150);
    }
    else if(this.tile && this.tile.content && this.tile.content.contentType == 'building') {
      ctx.fillText("Store : " + this.tile.content.actualContainingLevel + " / " + this.tile.content.contain, 20, 130);
      ctx.fillText("Power : " + this.tile.content.actualPower + " / " + this.tile.content.power, 20, 150);
    }

    ctx.fillText("Username : " + player.username, 20, 180);
    ctx.fillText("Level : " + player.level, 20, 200);
    ctx.fillText("Money : " + player.money, 20, 220);
    if (player.cropsCurrentlyHarvested) {
      ctx.fillText("Number of harvested crops :" + player.cropsCurrentlyHarvested.productivity, 20, 240);
    }

    ctx.fillText("Current tomato price : " + tomatoPrice, 20, 270);
    ctx.fillText("Current corn price : " + cornPrice, 20, 290);
    ctx.fillText("Current wheat price : " + wheatPrice, 20, 310);

    ctx.fillText("(Select tile after you have selected any action)", 20, 340);

    ctx.fillText("A : Press to conquer land !", 20, 360);
    ctx.fillText("Z : Press to harvest !", 20, 380);
    ctx.fillText("E : Press to watering !", 20, 400);
    ctx.fillText("R : Press to fertilize !", 20, 420);
    ctx.fillText("Q : Press to plant tomatoes !", 20, 440);
    ctx.fillText("S : Press to plant corn !", 20, 460);
    ctx.fillText("D : Press to plant wheat !", 20, 480);
    ctx.fillText("W : Press to build silo !", 20, 500);
    ctx.fillText("X : Press to build barn !", 20, 520);
    ctx.fillText("C : Press to build cold storage !", 20, 540);

    if (player.cropsCurrentlyHarvested) {
      ctx.fillText("T : Press to sell your harvest !", 20, 560);
      ctx.fillText("Y : Press to store your harvest !", 20, 580);
    }

    ctx.fillText("SPACE BAR : Press to auto center your position !", 20, 600);
  },

  setPlayerToFollow: function(player) {
    this.player = player;
  }

  /*
   *
   * "PRIVATE METHODS"
   *
   */

};

/*
 *
 * TILE CLASS
 *
 */

function Tile(x, y, posX, posY, width, height, image, canWalkOn, fertility, humidity, ownedById, ownedByName, content) {
  this.x = x;
  this.y = y;
  this.posX = posX;
  this.posY = posY;
  this.width = width;
  this.height = height;
  this.canWalkOn = canWalkOn;

  this.fertility = fertility;
  this.humidity = humidity;
  this.ownedById = ownedById;
  this.ownedByName = ownedByName;

  this.image = image;

  this.content = content;
  this.contentImg = null;
  this.imgName = '';
  this.imgId = '';
}

Tile.prototype = {

  /*
   *
   * "PUBLIC METHODS"
   *
   */

  draw: function (ctx, offsetX, offsetY) {
    ctx.drawImage(this.image, offsetX + this.posX, offsetY + this.posY, this.width, this.height);

    if (this.ownedById != null)
      this.drawOwnerMark(ctx, offsetX, offsetY);

    if (this.content)  {
      var imgName = '';
      var imgMaturationState = '';
      var imgHealthState = '';

      if (this.content.contentType == 'crops') {
        if (this.content.maturation < 10) { //SEEDED
          imgMaturationState = '1';
        }
        else if (this.content.maturation >= 10 && this.content.maturation < 30) { //SEEDLINGS
          imgMaturationState = '2';
        }
        else if (this.content.maturation >= 30 && this.content.maturation < 60) { //LITTLE PLANTS
          imgMaturationState = '2';
        }
        else if (this.content.maturation >= 60 && this.content.maturation < 80) { //PLANTS
          imgMaturationState = '3';
        }
        else if (this.content.maturation >= 80 && this.content.maturation <= 100) { //MATURE PLANTS
          imgMaturationState = '3';
        }
        else { //DEFAULT
          imgMaturationState = '1';
        }

        if (this.content.health < 20) { //BAD
          imgHealthState = '1';
        }
        else if (this.content.health >= 20 && this.content.health < 40) { //LOW
          imgHealthState = '2';
        }
        else if (this.content.health >= 40 && this.content.health < 50) { //AVERAGE
          imgHealthState = '2';
        }
        else if (this.content.health >= 50 && this.content.health < 80) { //MEDIUM
          imgHealthState = '3';
        }
        else if (this.content.health >= 80 && this.content.health <= 100) { //GOOD
          imgHealthState = '3';
        }
        else { //DEFAULT
          imgHealthState = '1';
        }
      }

      imgName = this.content.type;

      this.contentImg = CameloteEngine.getImageResources(imgName + imgMaturationState /*+ imgHealthState*/);

      var cWidth = this.width, cHeight = this.height;

      switch (this.content.type) {
        case 'barn':
          cWidth = this.width * 2;
          cHeight = this.height * 2;
          break;
        case 'cold_storage':
          cWidth = this.width * 3;
          cHeight = this.height * 2;
          break;
        default:
          cWidth = this.width;
          cHeight = this.height;
          break;
      }

      ctx.drawImage(this.contentImg, offsetX + this.posX, offsetY + this.posY, 164, 90);
    }
  },

  drawHover: function (ctx, offsetX, offsetY) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.moveTo(this.posX + offsetX + this.width / 2, this.posY + offsetY);
    ctx.lineTo(this.posX + offsetX + this.width, this.posY + offsetY + this.height / 2);
    ctx.lineTo(this.posX + offsetX, this.posY + offsetY + this.height / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.posX + offsetX + this.width / 2, this.posY + offsetY + this.height);
    ctx.lineTo(this.posX + offsetX + this.width, this.posY + offsetY + this.height / 2);
    ctx.lineTo(this.posX + offsetX, this.posY + offsetY + this.height / 2);
    ctx.fill();
    ctx.closePath();
  },

  drawOwnerMark: function (ctx, offsetX, offsetY) {
    ctx.lineWidth = 0.9;
    if (this.ownedById == player.id)
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
    else
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc((this.posX + offsetX + this.width / 2), (this.posY + offsetY + this.height / 2), 10, 0, 2 * Math.PI, false);
    ctx.stroke();
  },

  setCanWalkOn: function (can) {
    this.canWalkOn = can;
  },

  getCanWalkOn: function () {
    return this.canWalkOn;
  },

  getX: function () {
    return this.x;
  },

  getY: function() {
    return this.y;
  },

  getPosX: function() {
    return this.posX;
  },

  getPosY: function() {
    return this.posY;
  },

  getWidth: function() {
    return this.width;
  },

  getHeight: function() {
    return this.height;
  },

  getFertility: function() {
    return this.fertility;
  },

  getHumidity: function() {
    return this.humidity;
  },

  getOwnerId: function() {
    return this.ownedById;
  },

  setOwnerId: function(id) {
    this.ownedById = id;
  },

  getOwnerName: function() {
    return this.ownedByName;
  },

  setOwnerName: function(name) {
    this.ownedByName = name;
  },

  getContent: function() {
    return this.content;
  }

  /*
   *
   * "PRIVATE METHODS"
   *
   */

};

/*
 *
 * ANIMATION CLASS
 *
 */

var AnimationEnum = {
  Basic: 0,
  WalkUp: 1,
  WalkDown: 2,
  WalkLeft: 3,
  WalkRight: 4
}

function Animation() {
  this.frames = [];
  this.current = 0;

  this.definedTime = 0;
  this.time = Date.now();
}

Animation.prototype = {

  /*
   *
   * "PUBLIC METHODS"
   *
   */

  addFrame: function (x, y) {
    var f = { x: x, y: y };
    this.frames.push(f);
  },

  getFrame: function (delay) {
    var delta = delay - this.time;

    var f = this.frames[this.current];

    if ((delta / 1000) > this.definedTime) {
      this.current++;

      if (this.current >= this.frames.length)
        this.current = 0;

      this.time = delay;
    }

    return f;
  },

  setFrameDuration: function (time) {
    this.definedTime = time;
  }

  /*
   *
   * "PRIVATE METHODS"
   *
   */
};

/*
 *
 * ENTITY CLASS
 *
 */

function Entity(id, tile, width, height, image, ctx) {
  this.id = 'entity_' + id;

  this.tile = tile;
  this.nextTile = tile;

  this.path = [];

  this.width = width;
  this.height = height;

  this.animations = new Array();
  this.currentAnimation = AnimationEnum.Basic;
  this.time = Date.now();
  this.definedTime = 0.50;
  this.isMoving = false;

  this.image = image;

  this.canvasContext = ctx;
}

Entity.prototype = {

  /*
   *
   * "PUBLIC METHODS"
   *
   */

  update: function (delay) {
    if (this.path.length > 0) {
      this.isMoving = true;
      var delta = delay - this.time;
      if ((delta / 1000) > this.definedTime) {
        var temp = this.path.pop();
        if (temp.x > this.tile.x) {
          this.selectAnimation(AnimationEnum.WalkRight);
        }
        else if (temp.x < this.tile.x) {
          this.selectAnimation(AnimationEnum.WalkLeft);
        }
        else if (temp.y > this.tile.y) {
          this.selectAnimation(AnimationEnum.WalkDown);
        }
        else if (temp.y < this.tile.y) {
          this.selectAnimation(AnimationEnum.WalkUp);
        }
        else {
          this.selectAnimation(AnimationEnum.Basic);
        }
        this.tile = temp;
        this.time = delay;
      }
    }
    else {
      this.isMoving = false;
      this.tile = this.nextTile;
      this.selectAnimation(AnimationEnum.Basic);
    }
  },

  draw: function (offsetX, offsetY, delay) {
    this.canvasContext.drawImage(
      this.image,
      this.animations[this.currentAnimation].getFrame(delay).x,
      this.animations[this.currentAnimation].getFrame(delay).y,
      this.width,
      this.height,
      (this.tile.posX + ((this.tile.width - this.width) / 2)) + offsetX,
      (this.tile.posY - (this.height / 2)) + offsetY,
      this.width,
      this.height);
  },

  moveTo: function (tile, engine) {
    this.path = astar.search(engine.getMap(), this.getCurrentTile(), tile, false, false);
    if (this.path.length > 0) {
      this.path.reverse();
      this.nextTile = tile;
      return true;
    }
    return false;
  },

  setCurrentTile: function (tile) {
    this.tile = this.nextTile = tile;
  },

  getCurrentTile: function () {
    return this.tile;
  },

  addAnimation: function (type) {
    this.animations[type] = new Animation();
  },

  setAnimation: function (type) {
    return this.animations[type];
  },

  selectAnimation: function (type) {
    this.currentAnimation = type;
  },

  getIsMoving: function () {
    return this.isMoving;
  }

  /*
   *
   * "PRIVATE METHODS"
   *
   */

};