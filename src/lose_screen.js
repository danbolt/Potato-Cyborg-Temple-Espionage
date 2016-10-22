var LoseScreen = function () {
	//
};
LoseScreen.prototype.create = function() {
	this.game.camera.reset();

	this.game.add.bitmapText(32, 32, 'font', 'you lose sorry :(', 8);

	this.game.time.events.add(2000, function () {
		this.game.state.start('Gameplay');
	}, this);
};