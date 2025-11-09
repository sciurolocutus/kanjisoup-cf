var Street = function(x, y, xscale, yscale, repeat) {
	this.x = x;
	this.y = y;
	this.xscale = xscale;
	this.yscale = yscale;
	this.repeat = repeat;
}

Street.prototype.shiftX = function(dx) {
	this.x += dx;
}

Street.prototype.drawDottedLine = function(x, y, ctx) {
	ctx.beginPath();
	ctx.rect(x,y,this.xscale, this.yscale / 6);
	ctx.fillStyle = '#FFFFFF';
	ctx.fill();
	ctx.closePath();
}

Street.prototype.drawStreet = function(x, y, ctx) {
	ctx.beginPath();
	ctx.rect(x, y, 3 * this.xscale, this.yscale);
	ctx.fillStyle = '#5F5F5F';
	ctx.fill();
	ctx.closePath();
}

Street.prototype.draw = function(ctx) {
	var lx = this.x;
	var uy = this.y;
	var farRight = this.x + 3 * this.xscale;
	var farDown = this.y + this.yscale;
	for(var i=0; !!this.repeat && i< this.repeat; i++) {
		this.drawStreet(lx, this.y, ctx);
		this.drawDottedLine(lx + this.xscale, this.y + this.yscale / 3, ctx);
		lx += 3 * this.xscale;
	}
}
