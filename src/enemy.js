var EnemyGuard = function (game, x, y, player, foreground, isEvading, sightedPlayer, bulletPool) {
  Phaser.Sprite.call(this, game, x, y, 'sprite_sheet_32x32', 5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5, 1);

  this.player = player;
  this.foreground = foreground;
  this.bulletPool = bulletPool;

  this.isEvading = isEvading;
  this.sightedPlayer = sightedPlayer;

  this.patrolRoute = null;
  this.currentPatrolRouteIndex = 0;
  this.events.onKilled.add(function () { this.patrolRoute = null; this.currentPatrolRouteIndex = 0; this.stopShooting(); }, this);

  this.guardLoop = null;
  this.fireRate = 500;

  this.directionFacing = Directions.WEST;
  this.sightRange = 10 * 16;
  this.sightWidth = Math.PI / 2.5;

  this.walkSpeed = 100;

  // animations
  this.animations.add('walk_down_patrol', [4, 5], 4, true);
  this.animations.add('walk_up_patrol', [6, 7], 4, true);
  this.animations.add('walk_left_patrol', [10, 11], 4, true);
  this.animations.add('walk_right_patrol', [8, 9], 4, true);
  this.animations.add('walk_down_angry', [4, 5].map(function (i) { return i+8; }), 4, true);
  this.animations.add('walk_up_angry', [6, 7].map(function (i) { return i+8; }), 4, true);
  this.animations.add('walk_left_angry', [10, 11].map(function (i) { return i+8; }), 4, true);
  this.animations.add('walk_right_angry', [8, 9].map(function (i) { return i+8; }), 4, true);
};
EnemyGuard.prototype = Object.create(Phaser.Sprite.prototype);
EnemyGuard.prototype.constructor = EnemyGuard;
EnemyGuard.prototype.update = function () {
  if (this.alive === false) {
    return;
  }

  if (this.shootFlag === true) {
    this.shootFlag = false;

    this.shootBullet();
  }

  if (this.isEvading() === false) {
    // check if the player is in sight
    if (this.position.distance(this.player.position, true) < this.sightRange) {
      var guardAngleA = ((this.directionFacing / Directions.COUNT * Math.PI * 2 + (this.sightWidth / 2)) + Math.PI * 2) % (Math.PI * 2);
      var guardAngleB = ((this.directionFacing / Directions.COUNT * Math.PI * 2 - (this.sightWidth / 2)) + Math.PI * 2) % (Math.PI * 2);
      var playerAngle = (Math.PI * 2 + Math.atan2( this.player.y - this.position.y, this.player.x - this.position.x )) % (Math.PI * 2);

      if ((playerAngle > guardAngleB && playerAngle < guardAngleA) ||
            (this.directionFacing === Directions.EAST && (playerAngle < (this.sightWidth / 2) || playerAngle > (Math.PI * 2 - (this.sightWidth / 2)))))  {

        var rayCastResult = this.foreground.getRayCastTiles(new Phaser.Line(this.x, this.y, this.player.x, this.player.y), 4, true);

        if (rayCastResult.length < 1) {
          this.sightedPlayer();
          this.body.velocity.set(0, 0);
        }
      }
    }

    // follow our patrol route, if we have one
    if (this.patrolRoute !== null && this.isEvading() === false) {
      var currentPatrolNode = this.patrolRoute[this.currentPatrolRouteIndex];

      if (this.position.distance(new Phaser.Point( currentPatrolNode.x, currentPatrolNode.y)) < 3) {
        this.currentPatrolRouteIndex = (this.currentPatrolRouteIndex + 1) % this.patrolRoute.length;
      }
      var nextPatrolAngle = Math.atan2(currentPatrolNode.y - this.y, currentPatrolNode.x - this.x);
      this.body.velocity = new Phaser.Point(this.walkSpeed * Math.cos(nextPatrolAngle), this.walkSpeed * Math.sin(nextPatrolAngle));
      this.directionFacing =  ~~((((nextPatrolAngle + (Math.PI * 2)) % (Math.PI * 2) ) / (Math.PI * 2)) * Directions.COUNT);
    }
  }

  this.animations.play('walk_' + this.directionToString(this.directionFacing) + '_' + (this.isEvading() ? 'angry' : 'patrol'));
};
EnemyGuard.prototype.directionToString = function (d) {
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
EnemyGuard.prototype.shootBullet = function () {
  var newBullet = this.bulletPool.getFirstDead();
  
  if (newBullet !== null) {
    var shootAngle = Math.atan2(this.player.y - this.y, this.player.x - this.x);

    newBullet.revive();
    newBullet.setDirection(shootAngle);
    newBullet.x = this.x;
    newBullet.y = this.y;

    this.directionFacing =  ~~((((shootAngle + (Math.PI * 2)) % (Math.PI * 2) ) / (Math.PI * 2)) * Directions.COUNT);
  }
};
EnemyGuard.prototype.startShooting = function () {
  if (this.isEvading() && this.guardLoop === null) {
    this.guardLoop = this.game.time.events.loop(this.fireRate, function () {  this.shootFlag = true; }, this);
  }
};
EnemyGuard.prototype.stopShooting = function () {
  if (this.guardLoop !== null) {
    this.game.time.events.remove(this.guardLoop);
  }
};

var EnemyBullet = function (game, x, y, direction, foreground) {
  Phaser.Sprite.call(this, game, x, y, 'sprite_sheet_16x16', 80);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(8, 8);
  this.anchor.set(0.5);

  this.bulletSpeed = 200;

  this.setDirection(direction);

  this.animations.add('spin', [80, 81, 82, 83], 16, true);
  this.animations.play('spin');
};
EnemyBullet.prototype = Object.create(Phaser.Sprite.prototype);
EnemyBullet.prototype.constructor = EnemyBullet;
EnemyBullet.prototype.setDirection = function(direction) {
  this.body.velocity = new Phaser.Point(this.bulletSpeed * Math.cos(direction), this.bulletSpeed * Math.sin(direction));
};