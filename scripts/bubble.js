//creates initial variables for object constructor function
var id;
var x;
var y;
var r;
var vx;
var vy;
var label;
var volume;
var audio;

//object constructor function
function Bubble(id, label, radius, volume, speed, maxX, maxY, audio) {
	this.id = id;
	this.r = radius;
	this.x = randomInteger(radius,maxX - radius);
	this.y = randomInteger(radius,maxY - radius);
	this.vx = getRandomSign() * speed * 0.1;
	this.vy = getRandomSign() * speed * 0.1;
	this.label = label;
	this.volume = volume;
	this.audio = audio;
}

//Draws the bubble with label; using clip to draw image so bubbles look 'transparent'
Bubble.prototype.draw = function(ctx, container) {
	ctx.save();
	
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
	ctx.closePath();
	
	//draw the image while clipped so image appears in circles
    //draw background colour first as image used is a png /w transparancy
	ctx.clip();
	ctx.beginPath();
	ctx.fillStyle ="#D6FF99";
	ctx.rect(0,0,container.width, container.height);
	ctx.fill()
	ctx.closePath();
	
	ctx.drawImage(container.img,  container.width / 2 - container.imgWidth / 2, container.y, container.imgWidth, container.imgHeight);
	
	ctx.font = '12px Trebuchet MS';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#481620';  
	ctx.fillText(this.label, this.x, this.y);
	
	ctx.restore();
}

//increase the x value and y value by the related speed values
Bubble.prototype.move = function() {
	this.x = this.x + this.vx;
	this.y = this.y + this.vy;
}

//following variables returns certain variables from the object
Bubble.prototype.getX = function() {
	return this.x;
}

Bubble.prototype.getY = function() {
	return this.y;
}

Bubble.prototype.getR = function() {
	return this.r;
}

Bubble.prototype.setR = function(radius) {
	this.r = radius;
}

Bubble.prototype.getVx = function() {
	return this.vx;
}

Bubble.prototype.getVy = function() {
	return this.vy;
}

Bubble.prototype.getVolume = function(){
	return this.volume;
}


Bubble.prototype.getLabel = function(){
	return this.label;
}

//changes volume based on inputted value
Bubble.prototype.setVolume = function(newVolume){
	this.volume = newVolume;
}

//when it hits the container walls, it bounces backward before it does speech synthesis
Bubble.prototype.containerBounce = function(height, width, x, y) {
	var bounced = false;
	if((this.x - this.r + this.vx < x )|| (this.x + this.r + this.vx > x + width)) {
		this.vx = this.vx * -1;
		bounced = true;
	}
	if((this.y + this.r + this.vy > y + height) || (this.y - this.r + this.vy < y)) {
		this.vy = this.vy * -1;
		bounced = true;
	}
	//this.move();
	return bounced;
}

//create a random integer with a minimum and maximum value
function randomInteger(mini,maxi) {
	var randomInt = 0;
	while(randomInt == 0) {
		randomInt = Math.floor(Math.random() * (maxi - mini + 1)) + mini;
	}
	return randomInt;
}

function getRandomSign(){
	var randInt = 0;
	while(randInt === 0){
		randInt = randomInteger(-1,1);
	}
	return randInt;
}