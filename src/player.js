var Player = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'sprite_sheet_16x32', 0);

  this.playerWalkSpeed = 100;

  this.disableMovement = false;

  this.direction = Directions.SOUTH;

  // add animations
  this.animations.add('walk_down', [0, 1], 4, true);
  this.animations.add('walk_up', [2, 3], 4, true);
  this.animations.add('walk_left', [6, 7], 4, true);
  this.animations.add('walk_right', [4, 5], 4, true);
  this.animations.add('idle_down', [0], 4, true);
  this.animations.add('idle_up', [2], 4, true);
  this.animations.add('idle_left', [6], 4, true);
  this.animations.add('idle_right', [4], 4, true);

  this.animations.play('walk_down');

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5);
  this.body.offset.y = 16;
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.directionToString = function (d) {
  switch (d) {
    case Directions.EAST:
      return 'right';
    case Directions.WEST:
      return 'left';
    case Directions.NORTH:
      return 'up';
    case Directions.SOUTH:
      return 'down';
    default:
      return 'down';
  };
}
Player.prototype.update = function () {

  if (this.disableMovement === false) {
    // move the player velocity based on keyboard input
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
      this.body.velocity.x = this.playerWalkSpeed;
      this.direction = Directions.EAST;
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
      this.body.velocity.x = -this.playerWalkSpeed;
      this.direction = Directions.WEST;
    } else {
      this.body.velocity.x = 0;
    }

    if (this.game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
      this.body.velocity.y = this.playerWalkSpeed;
      this.direction = Directions.SOUTH;
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
      this.body.velocity.y = -this.playerWalkSpeed;
      this.direction = Directions.NORTH;
    } else {
      this.body.velocity.y = 0;
    }
  } else {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  this.animations.play( ((this.body.velocity.x === 0 && this.body.velocity.y === 0) ? 'idle_' : 'walk_') + this.directionToString(this.direction) );
};