var Player = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 3);

  this.playerWalkSpeed = 100;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function () {
  // move the player velocity based on keyboard input
  if (this.game.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
    this.body.velocity.x = this.playerWalkSpeed;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
    this.body.velocity.x = -this.playerWalkSpeed;
  } else {
    this.body.velocity.x = 0;
  }

  if (this.game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
    this.body.velocity.y = this.playerWalkSpeed;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
    this.body.velocity.y = -this.playerWalkSpeed;
  } else {
    this.body.velocity.y = 0;
  }
};

var Gameplay = function () {
  this.player = null;
};
Gameplay.prototype.init = function() {
  //
};
Gameplay.prototype.preload = function() {
  //
};
Gameplay.prototype.create = function() {
  this.game.add.bitmapText(32, 32, 'font', 'lets make a player', 8);

  this.player = new Player(this.game, 0, 64);
  this.game.add.existing(this.player);
};
Gameplay.prototype.shutdown = function () {
  this.player = null;
};