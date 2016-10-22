var EnemyGuard = function (game, x, y, player, foreground, isEvading, sightedPlayer, bulletPool) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5);

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
  this.sightRange = 5 * 16;
  this.sightWidth = Math.PI / 2.5;

  this.walkSpeed = 100;
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
      var guardAngleA = this.directionFacing / Directions.COUNT * Math.PI * 2 + (this.sightWidth / 2);
      var guardAngleB = this.directionFacing / Directions.COUNT * Math.PI * 2 - (this.sightWidth / 2);
      var playerAngle = (Math.PI * 2 + Math.atan2( this.player.y - this.position.y, this.player.x - this.position.x )) % (Math.PI * 2);

      if (playerAngle > guardAngleB && playerAngle < guardAngleA) {

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
};
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
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 6);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(8, 8);
  this.anchor.set(0.5);

  this.bulletSpeed = 200;

  this.setDirection(direction);
};
EnemyBullet.prototype = Object.create(Phaser.Sprite.prototype);
EnemyBullet.prototype.constructor = EnemyBullet;
EnemyBullet.prototype.setDirection = function(direction) {
  this.body.velocity = new Phaser.Point(this.bulletSpeed * Math.cos(direction), this.bulletSpeed * Math.sin(direction));
};