var CyclicalObject = function(phaseLength) {
	this.phaseLength = phaseLength;
}

CyclicalObject.prototype.atTheta = function(theta) {
	return (theta % this.phaseLength) / this.phaseLength;
}

var drawSquare = function(x,y,w,ctx) {
	ctx.beginPath();
	ctx.rect(x,y,w,w);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
	ctx.closePath();
}

/**
 * A wheel has an outer radius and an inner radius.
 * Later, it may have a rotation angle, if we want the wheel to show motion
 * (it will, of course, have to no longer have perfect rotational symmetry, which it has for now).
 */
var drawWheel = function(x, y, r, theta, ctx) {
	var innerRadius = 0.6*r;
	//Draw the tire
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2.0, false);
	ctx.lineWidth = 15;
	//ctx.strokeStyle = 'black';
	//ctx.stroke();
	ctx.fillStyle = "#121212";
	ctx.fill();
	ctx.closePath();

	//Draw the wheel
	ctx.beginPath();
	ctx.arc(x, y, innerRadius, 0, Math.PI * 2.0, false);
	ctx.lineWidth = 5;
	ctx.fillStyle = '#6F6F6F';
	ctx.fill();
	ctx.closePath();

	//Draw a line to indicate angle
	drawLineAtAngle(x, y, r, theta, ctx);
}

var drawLineAtAngle = function(x, y, r, theta, ctx)  {
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x+r*Math.cos(theta), y+r*Math.sin(theta));
	ctx.strokeStyle = 'rgb(50, 50, 50)';
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.closePath();
}

var drawCarBody = function(x, y, scale, ctx) {
	ctx.beginPath();
	ctx.rect(x,y,scale*3,scale);
	ctx.fillStyle = "pink";
	ctx.fill();
	ctx.arc(x+scale*1.5, y, scale, Math.PI, Math.PI * 2.0, false);
	ctx.fill();
	ctx.closePath();
}

var Engine = function() {
	this.stateIndex = 1;
	this.heat = 0;
}

Engine.states = ['R', 'N', 1, 2, 3, 4, 5];
Engine.speedRanges = {
	'R' : {'lo': -10, 'hi': 0},
	'N' : {'lo': -100, 'hi': 4000},
	1 : {'lo': 1, 'hi': 10},
	2 : {'lo': 10, 'hi': 20},
	3 : {'lo': 15, 'hi': 35},
	4 : {'lo': 30, 'hi': 45},
	5 : {'lo': 40, 'hi': 75}
};

Engine.prototype.clampSpeed = function(s) {
	var speedRange = Engine.speedRanges[this.getState()];
	if(s < speedRange['lo']) {
		this.heat += 5;
		return speedRange['lo'];
	} else if(s > speedRange['hi']) {
		this.head += 1;
		return speedRange['hi'];
	} else {
		return s;
	}
}

Engine.prototype.checkSpeed = function(s) {
	var speedRange = Engine.speedRanges[this.getState()];
	if(s < speedRange['lo']) {
		return 'tooLo';
	} else if(s > speedRange['hi']) {
		return 'tooHi';
	} else {
		return 'ok';
	}
}

Engine.prototype.getState = function() {
	return Engine.states[this.stateIndex];
}

Engine.prototype.shiftUp = function() {
	if(this.stateIndex < Engine.states.length - 1) {
		this.stateIndex++;
	}
}

Engine.prototype.shiftDown = function() {
	if(this.stateIndex > 0) {
		this.stateIndex--;
	}
}

Engine.prototype.neutral = function() {
	this.stateIndex = 1;
}

var Car = function (x, y, theta, scale) {
	this.wheelTheta = theta;
	this.x = x;
	this.y = y;
	this.scale = scale;
	this.speed = 0;
	this.acceleration = 0;
	this.engine = new Engine();
	this.policeLight = new PoliceLight(40, ['#FF0000', '#0000FF']);
}

Car.prototype.modSpeed = function(ds) {
	this.speed += ds;
}

Car.prototype.tickSpeed = function() {
	this.speed += this.acceleration;
}

Car.prototype.modAcceleration = function(da) {
	this.acceleration += da;
}

Car.prototype.setTheta = function(theta) {
	this.wheelTheta = theta;
}

Car.prototype.draw = function(ctx) {
	drawCarBody(this.x+this.scale*1.5, this.y - this.scale, this.scale, ctx);
	drawWheel(this.x+this.scale, this.y, this.scale, this.wheelTheta, ctx);
	drawWheel(this.x+5*this.scale, this.y, this.scale, this.wheelTheta, ctx);
	if(!!this.policeMode) {
		this.policeLight.draw(this.x + this.scale * 2.75, this.y - this.scale * 2, this.scale / 4, t, ctx);
	}
}

var CirclingArray = function(arr) {
	this.arr = arr;
}

CirclingArray.prototype.get = function(i) {
	if(i >= this.arr.length) {
		return this.arr[i % this.arr.length];
	} else {
		return this.arr[i];
	}
}

var PoliceLight = function(phaseLength, colors) {
	this.phaseLength = phaseLength;
	if(colors instanceof CirclingArray) {
		this.colors = colors;
	} else {
		this.colors = new CirclingArray(colors);
	}
	this.currentColor = this.colors.get(0);
}

PoliceLight.prototype.updateColor = function(theta) {
	var i = Math.floor(theta / this.phaseLength);
	this.currentColor = this.colors.get(i);
	//console.log('phase: ' + theta + ', phaseLength = ' + this.phaseLength + ', result: ' + (theta / this.phaseLength));
	//console.log('Current color: ' + this.currentColor);
}

PoliceLight.prototype.draw = function(x, y, scale, theta, ctx) {
	var i = Math.floor(theta / this.phaseLength);
	var currentColor = this.colors.get(i);
	var nextColor = this.colors.get(i+1);

	var grd = ctx.createLinearGradient(x, 0, x + scale * 1.5, 0);
	grd.addColorStop(0, currentColor);
	grd.addColorStop(1, nextColor);

	this.currentColor = grd;

	ctx.beginPath();
	ctx.rect(x,y,scale * 1.5,scale);
	ctx.fillStyle = this.currentColor;
	ctx.fill();
	ctx.closePath();
}

var Spedometer = function(scale) {
	this.scale = scale; // 1 "speed" = how many "mph/kph"?
}

Spedometer.draw = function(speed, ctx) {
	//TODO: draw at least an arm pointed to the appropriate place on a number arc
}

var t = 0;

function animateTheScene(car, street, i, maxIt, animSpeed, ctx) {
	var streetTheta = -(animSpeed * i / maxIt * street.xscale);
	street.shiftX(streetTheta);
	//console.log('Drawing that street at i=' + i + '; x=' + street.x);
	street.draw(ctx);

	var carTheta = animSpeed * i * Math.PI * 2 / maxIt;
	car.setTheta(carTheta);
	car.draw(ctx);


	if(Math.random() > 0.3) {
		car.acceleration++;
		car.speed = car.engine.clampSpeed(car.speed);
	}
	car.tickSpeed();
	//animSpeed = car.speed;

	if(i<maxIt) {
		i++;
	} else {
		//street.x = street.x % street.scale;
		console.log(street.x);
		//street.shiftX(street.scale * maxIt);
		street.x += animSpeed * street.xscale * maxIt / 2;
		console.log(animSpeed * street.xscale * maxIt / 2);
		//console.log(streetTheta * maxIt);
		console.log(street.xscale);
		console.log(street.x);
		i=0;
	}

	t++;

	if(!gameEnded) {
		requestAnimFrame(function() { animateTheScene(car, street, i, maxIt, animSpeed, ctx); });
	} else {
		drawGameEnd(ctx);
	}
}


function animateTheCar(car, i, maxIt, animSpeed, ctx) {
	//console.log('Drawing that car at i=' + i);
	var theta = animSpeed * i * Math.PI * 2 / maxIt;
	car.setTheta(theta);
	car.draw(ctx);
	if(i<maxIt) {
		i++;
	} else {
		i=0;
	}
	requestAnimFrame(function() { animateTheCar(car, i, maxIt, animSpeed, ctx); });
}

function animateTheStreet(street, i, maxIt, animSpeed, ctx) {
	var theta = -(animSpeed * i / maxIt * street.xscale);
	street.shiftX(theta);
	//console.log('Drawing that street at i=' + i + '; x=' + street.x);
	if(i < maxIt) {
		i++;
	} else {
		i = 0;
	}
	if(!gameEnded) {
		requestAnimFrame(function() { animateTheStreet(street, i, maxIt, animSpeed, ctx); });
	} else {
		drawGameEnd(ctx);
	}
}

function drawGameEnd(ctx) {
	//well, it'll happen sometime.
}

var requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		}
})();


var audioLibrary = {
	'engineStart' : 'vroomvroom.mp3',
	'errrk' : new RandomAudio(['vlabrakesqueal1.mp3', 'vlabrakesqueal2.mp3', 'vlabrakesqueal3.mp3']),
	'crash' : 'crash.mp3',
	'juke' : 'Adventure.mp3',
	'squirrel' : 'onosqrl.mp3',
	'late' : 'runninglate.mp3',
	'yellow' : 'yellowmeansgo.mp3',
	'weewoo' : 'weewoo.mp3',
	'intro' : new SequencedAudio(['minorphrase1.mp3', 'whydidithinkiwasahuman.mp3', 'abruptarpeggiation1.mp3', 'whateverimacarnow.mp3', 'violaenginestart.mp3', 'runninglate.mp3']),
	'blah' : new SequencedAudio(['violaenginestart.mp3']) //short version
}

var gameEnded = false;

var paulStretchMode = true;
var as = new AudioState (audioLibrary, './audio/paulstretch');

var displayGame = function() {
	var canvas = document.getElementById("theCanvas");
	canvas.width = window.innerWidth * 0.9;
	canvas.height = window.innerHeight * 0.9;
	var w = canvas.width;
	var h = canvas.height;
	var ctx = canvas.getContext("2d");

	//Draw Testing code
	for(var i=4; i<14; i++) {
		var theta = i * Math.PI * 2 / 10;
		//drawWheel(40 * i  + 10, 10 * i + 10, 20, theta, ctx);
		var car = new Car(20 * i + 10, Math.pow(i, 1.3) * 15, theta, i * 1.3);
		car.draw(ctx);
	}


	ctx.clearRect(0, 0, canvas.width, canvas.height);


	//draw the street
	var street = new Street(0, 0, w / 12, (h / 4), 4);
	street.draw(ctx);
	
	var maxIters = 40;

	//draw the car -- don't start animation yet
	var car = new Car(w / 20, h / 4, theta, w / 20);
	car.setTheta(0);
	car.draw(ctx);

	var beginAnimation = function() {
		animateTheScene(car, street, 0, maxIters, 1, ctx);
	}

	var waitForCompletion = function(aud) {
		if(aud.isPlaying()) {
			console.log('waiting for ' + aud.toString());
			setTimeout(function() {
					waitForIntro();
					}, 1000);
		}
	}


	var waitForAll = function(i, finalDelegate) {
		if(i >= audioLibrary['intro'].fileList.length) {
			return finalDelegate();
		}
		var curr = as.startPlaying('intro');
		console.log('playing: ' + curr.toString());
		curr.addEventListener('ended',function() {
				console.log(curr + ' ended');
				waitForAll(i+1, finalDelegate);
				});
	}
	waitForAll(0, beginAnimation);

	var keyMap = {
		'ArrowDown': function(event) {
			as.startPlaying('errrk', true);
			car.engine.shiftDown();
		},
		'ArrowUp': function(event) {
			as.startPlaying('engineStart', false);
			car.engine.shiftUp();
		},
		'ArrowRight': function(event) {
			as.startPlaying('yellow', false);
		},
		'ArrowLeft': function(event) {
			as.startPlaying('squirrel', false);
		},
		'Escape': function(event) {
			as.startPlaying('crash', true);
			gameEnded = true;
		},
		'Shift': function(event) {
			//console.log(JSON.stringify(event));
			as.startPlaying('juke', false);
		},
		'p': function(event) {
			car.policeMode = !!!car.policeMode; //toggle police mode
			if(car.policeMode) {
				as.startPlaying('weewoo', false);
			}
		},
		'r': function(event) {
			gameEnded = false;
			beginAnimation();
		},
		's': function(event) {
			paulStretchMode = !!!paulStretchMode;
			if(paulStretchMode) {
				as.basePath = './audio/paulstretch';
			} else {
				as.basePath = './audio';
			}
		}
	};


	var kl = new KeyListener(document, keyMap);
}

/**
 * doc is meant to be "the document" (which can observe keypresses)
 * keyMap is an object mapping keys ('h', 'j', 'k', 'l', 'ArrowDown', 'ArrowLeft') onto behaviors
 */
var KeyListener = function(doc, keyMap) {
	this.keyMap = keyMap;
	document.addEventListener('keydown', function(event) {
		var k = event.key;
		//console.log('key down: ' + k);
		if(keyMap[k]) {
			keyMap[k](event);
		}
	});
}

var gameState = function() {
	this.playerLocation = 0;
	this.playerSpeed = 0;
	this.crashed = false;
}

//TODO: generate obstacles sometimes
gameState.prototype.addObstacles = function() {

}
