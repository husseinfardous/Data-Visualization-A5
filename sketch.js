function setup() {
	createCanvas(800,600); // make an HTML canvas element width x height pixels
}

	let NOTCH_DIM = 5;

function drawVat(x, y, b, h) {
	noFill();
	beginShape()
	vertex(x, y);
	vertex(x + b, y);
	vertex(x + b, y - h);
	vertex(x + b + NOTCH_DIM, y - (h + NOTCH_DIM));
	vertex(x, y - (h + NOTCH_DIM));

	endShape(CLOSE);
}

function draw() {
	background(225);

	let SECONDS = {
		x : 350,
		y : 200,
		base : 20,
		height : 120
	};

	let MINUTES = {
		x : 320,
		y : 325,
		base : 4 * SECONDS.base,
		height: 120
	};

	let HOURS = {
		x : 200,
		y : 426,
		base : 4 * MINUTES.base,
		height: 96
	};


	// Seconds, minutes, and hours water vats in order
	drawVat(SECONDS.x, SECONDS.y, SECONDS.base, SECONDS.height);
	drawVat(MINUTES.x, MINUTES.y, MINUTES.base, MINUTES.height);
	drawVat(HOURS.x, HOURS.y, HOURS.base, HOURS.height);

	fill('#B0E0E6');
	secondsWater = rect(SECONDS.x, SECONDS.y, SECONDS.base, -2*second());
	minutesWater = rect(MINUTES.x, MINUTES.y, MINUTES.base, -2*minute());
	hoursWater = rect(HOURS.x, HOURS.y, HOURS.base, -4*hour());

	fill('#1E90FF');
	for(let i = 0; i < 7000; i++){
		point(random(800), random(600));
	}
	// minutesWater = rect(
	// if(second() === 59) {
	// 	targetHeight = (MINUTES.height + NOTCH_DIM);
	// 	for(i = 0; i < 100000; i ++){
	// 		rect(SECONDS.x, SECONDS.y, SECONDS.base, i/2000 * targetHeight);
	// 	}
	// }
}
