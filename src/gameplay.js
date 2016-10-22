var Player = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 3);

  this.playerWalkSpeed = 100;

  this.disableMovement = false;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5);
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function () {

  if (this.disableMovement === false) {
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
  } else {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }
};

var Gameplay = function () {
  this.player = null;

  this.isScrolling = false;

  this.map = null;
  this.foreground = null;
};
Gameplay.prototype.init = function() {
  //
};
Gameplay.prototype.preload = function() {
  //
};
Gameplay.prototype.create = function() {
  // create map
  this.map = this.game.add.tilemap('level1');
  this.map.addTilesetImage('sheet', 'test16x16_tile');
  this.map.setCollisionByExclusion([0]);
  this.foreground = this.map.createLayer('Foreground');

  // enable collision detections with map
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  this.game.add.bitmapText(32, 32, 'font', 'lets scroll the map', 8);

  this.player = new Player(this.game, 64, 64);
  this.game.add.existing(this.player);

  // setup camera scrolling
  this.isScrolling = false;
  this.camera.roundPx = true;
  this.camera.bounds = null;
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.player, this.foreground);

  if (this.isScrolling === false) {
    if (this.player.x > (this.camera.x + this.camera.width) ||
        this.player.x < (this.camera.x) ||
        this.player.y > (this.camera.y + this.camera.height) ||
        this.player.y < (this.camera.y)) {
      
        this.isScrolling = true;
        this.player.disableMovement = true;

        var cameraShuffle = this.game.add.tween(this.camera);
        var targetX = (~~(this.player.x / this.camera.width)) * this.camera.width;
        var targetY = (~~(this.player.y / this.camera.height)) * this.camera.height;
        cameraShuffle.to( { x:  targetX, y: targetY }, 500 );
        cameraShuffle.onComplete.add(function () {
          this.isScrolling = false;
          this.player.disableMovement = false;
        }, this);
        cameraShuffle.start();
    }
  }
};/*
Gameplay.prototype.render = function () {
  this.game.debug.body(this.player);
};
*/
Gameplay.prototype.shutdown = function () {
  this.player = null;

  this.map = null;
  this.foreground = null;
};