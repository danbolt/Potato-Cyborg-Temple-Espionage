var WinScreen = function () {
	//
};
WinScreen.prototype.create = function() {
	this.game.camera.reset();

	this.game.add.bitmapText(32, 32, 'font', 'nice you win ^_^', 8);

	this.game.time.events.add(2000, function () {
		this.game.state.start('Gameplay');
	}, this);
};