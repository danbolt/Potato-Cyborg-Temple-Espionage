var Load = function () {
	//
};
Load.prototype.preload = function() {
  this.game.load.spritesheet('test16x16', 'asset/img/16x16SquareSheet.png', 16, 16);
};
Load.prototype.create = function() {
 	this.game.state.start('Gameplay');
};