function Farmer(id, tile, width, height, image, ctx) {
	this.id = 'player_' + id;

  this.level = 0;

	// Entity base class
	this.entity = new Entity(this.id, tile, width, height, image, ctx);

	this.prepare();

	this.entity.selectAnimation(AnimationEnum.WalkUp);
}

Farmer.prototype = {

	/*
   *
   * "PUBLIC METHODS"
   *
  */

  getBaseEntity: function() {
    return this.entity;
  },

  update: function(delay, engine, playerId) {
    if (('player_' + playerId) == this.id) {
      if (this.entity.getIsMoving()) {
        engine.setUserCanMoveMap(false);
        engine.moveMap(this.getBaseEntity());
      }
      else {
        engine.setUserCanMoveMap(true);
        engine.moveMap(-1);
      }
    }
  	this.entity.update(delay);
  },

 	draw: function(offsetX, offsetY, delay) {
 		this.entity.draw(offsetX, offsetY, delay);
 	},

  getLevel: function() {
    return this.level;
  },

  /*
   *
   * "PRIVATE METHODS"
   *
  */

  prepare: function() {
  	// Basic animation
  	this.entity.addAnimation(AnimationEnum.Basic);
  	this.entity.setAnimation(AnimationEnum.Basic).addFrame(30, 1040);

  	// WalkUp animation
  	this.entity.addAnimation(AnimationEnum.WalkUp);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(175, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(304, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(434, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(553, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(669, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(809, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(941, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).addFrame(1070, 533);
  	this.entity.setAnimation(AnimationEnum.WalkUp).setFrameDuration(0.10);

  	// WalkDown animation
  	this.entity.addAnimation(AnimationEnum.WalkDown);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(175, 1045);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(304, 1045);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(434, 1045);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(553, 1045);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(669, 1045);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(809, 1045);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(941, 1045);
  	this.entity.setAnimation(AnimationEnum.WalkDown).addFrame(1070, 1045);

  	this.entity.setAnimation(AnimationEnum.WalkDown).setFrameDuration(0.10);
  	
  	// WalkLeft animation
  	this.entity.addAnimation(AnimationEnum.WalkLeft);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(175, 789);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(304, 789);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(434, 789);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(553, 789);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(669, 789);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(809, 789);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(941, 789);
  	this.entity.setAnimation(AnimationEnum.WalkLeft).addFrame(1070, 789);

  	this.entity.setAnimation(AnimationEnum.WalkLeft).setFrameDuration(0.10);
  	
  	// WalkRight animation
  	this.entity.addAnimation(AnimationEnum.WalkRight);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(175, 277);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(304, 277);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(434, 277);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(553, 277);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(669, 277);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(809, 277);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(941, 277);
  	this.entity.setAnimation(AnimationEnum.WalkRight).addFrame(1070, 277);
  	
  	this.entity.setAnimation(AnimationEnum.WalkRight).setFrameDuration(0.10);
  }

};