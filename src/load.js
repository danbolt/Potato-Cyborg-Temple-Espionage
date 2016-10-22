var Load = function () {
	//
};
Load.prototype.preload = function() {
  this.game.load.spritesheet('test16x16', 'asset/img/16x16SquareSheet.png', 16, 16);
  this.game.load.image('test16x16_tile', 'asset/img/16x16SquareSheet.png');

  this.game.load.tilemap('level1', 'asset/map/level1.json', undefined, Phaser.Tilemap.TILED_JSON);
};
Load.prototype.create = function() {
 	this.game.state.start('Gameplay');
};