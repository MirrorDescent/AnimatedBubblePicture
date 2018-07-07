//global variables for drawing and other functions
var canvas = document.getElementById("testCanvas");
var ctx = canvas.getContext("2d");
var fps = 200;
var canvasHeight = canvas.height;
var canvasWidth = canvas.width;
var maxRadius = canvasHeight / 1.1;
var maxVolume = 100;
var minRadius = canvasHeight * 0.1;
var synth = window.speechSynthesis;
var voices = synth.getVoices();
var link;
var foregroundColor = "#99CCF9";
var inEdit = false;

//audio array containing all chimes used currently
var audio = [new Howl({src:"media/audio/chimeOne.wav"}),new Howl({src:"media/audio/chimeTwo.wav"}),new Howl({src:"media/audio/chimeThree.wav"}), new Howl({src:"media/audio/chimeFour.wav"}), new Howl({src:"media/audio/chimeFive.wav"}), new Howl({src:"media/audio/chimeSix.wav"}), new Howl({src:"media/audio/chimeSeven.wav"})]

//list of bubbles to display in bubble picture
var bubbles = new Array();

//object to store information about canvas
var container = {
	x: 0,
	y: 0,
	width: canvasWidth,
	height: canvasHeight,
	img: document.getElementById("art"),
	imgHeight: 0,
	imgWidth: 0

};

//word list for bubbles to be created from; this can be replaced by an API call for database use
var wordList = [
      {label: "Hiraeth",size: 3},
      {label: "Ethereal",size: 2},
      {label: "Epithany",size: 6},
      {label: "Luminescence",size: 2},
      {label: "Solitude",size: 7},
      {label: "Phosphenes",size: 1},
      {label: "Ephemeral",size: 1}];

window.onload = function(){
    //changes custom look of a div to current colour
    document.getElementById("overlay-colour").style.backgroundColor = foregroundColor;
    
	//fit canvas to containing div size.
	container.width = document.getElementById('pictureContainer').offsetWidth; //needs to be responsive
	container.height = document.getElementById('pictureContainer').offsetHeight;
	canvas.width = container.width;
	canvas.height = container.height;
	
	//calculate size of image keeping original proportions
	var imageRatio = container.height/container.img.naturalHeight;
	container.imgHeight = container.height;
	container.imgWidth = container.img.naturalWidth * imageRatio;
	container.width = container.imgWidth;  //resize container and canvas to fit image width
	canvas.width = container.width;
	
    //changes the values of the range slider and colour picker
	document.getElementById("sizeRange").max = maxRadius;
	document.getElementById("sizeRange").min = minRadius;
	document.getElementById("sizeRange").value = minRadius;
	
	document.getElementById("fgColour").value = foregroundColor;
	document.getElementById("editPanel").style.display = 'block';
	document.getElementById("sizeRange").disabled = true;
	
	bubbles = addBubbles(wordList); 
    
	//asks for the initial frame
	requestAnimationFrame(animation);
}

//function to create bubbles using given words
function addBubbles(words){
	var bubbleList = new Array();
	//allow for no words available
	if(!words.size > 0){
		var highestWordCount = getHighestWordCount(words);
		for(i=0; i < words.length; i++) {
			//calculate radius based on number of words
			var sizeFactor = words[i].size / highestWordCount;
			var speed = Math.floor(sizeFactor * 7);
            console.log(speed);
            
            //uses object javascript to create new object
			var bubbleObj = new Bubble(i, words[i].label, (sizeFactor * maxRadius), sizeFactor, speed, container.width, container.height, audio[i]); 
			
			bubbleList.push(bubbleObj);
		}		
	}
	return bubbleList;
}

//finds the most occurring word 
function getHighestWordCount(wordList) {
	var highestCount = 0;
	for(var i=0; i < wordList.length; i++) {
		if(wordList[i].size > highestCount) {
			highestCount = wordList[i].size;
		}
	}
	return highestCount;
}

//animates the bubbles themselves
function animation() {
    //draws a white square to "clear" canvas
    ctx.fillStyle = foregroundColor;
    ctx.rect(container.x, container.y, container.width, container.height);
    ctx.fill();

    for(var i = 0; i < bubbles.length; i++) {
        bubbles[i].draw(ctx, container);
        
        if(!inEdit) {
            //plays audio when hitting edges of container
            if(bubbles[i].containerBounce(container.height, container.width, container.x, container.y)){
                bubbles[i].audio.volume(bubbles[i].getVolume());
                bubbles[i].audio.play();
            }
            else{
                bubbles[i].move();					
            }
        }
    }
    //creates timeout to repeat animation indefinetely 
	setTimeout(function(){
		requestAnimationFrame(animation);
	}, 1000/fps);		
}

function isIntersect(point, circle) {
	return Math.sqrt((point.mx-circle.x) * (point.mx - circle.x) + (point.my - circle.y) * (point.my - circle.y)) < circle.r;
}

//when mouse is clicked in canvas, open edit modal
canvas.addEventListener("mousedown", function(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseClick = {
		mx: e.clientX - rect.left,
		my: e.clientY - rect.top
	}
    
	var i=0;
    
	while(!inEdit && i < bubbles.length){	
		if(isIntersect(mouseClick, bubbles[i])) {
			document.getElementById("editHeading").innerHTML = "<b>" + bubbles[i].label + "</b>";
			document.getElementById("sizeRange").value = bubbles[i].r;
			document.getElementById("sizeRange").disabled = false;
			inEdit = true;
		}
		i++;
	}
    
	if(!inEdit){
		document.getElementById("editHeading").innerHTML = "";
		document.getElementById("sizeRange").disabled = true;	
		inEdit = true;
	}
	openModal();
});

//changes size when being edited
function changeSize(){
	for(var i = 0; i < bubbles.length; i++) {
		if(document.getElementById("editHeading").innerHTML == "<b>" + bubbles[i].label + "</b>") {
			var radius = parseInt(document.getElementById("sizeRange").value);
			var volume = parseInt(document.getElementById("sizeRange").value);
			bubbles[i].setR(radius);
			bubbles[i].setVolume(volume);
		}
	}
    //changes preview to replicate changes happening
    getSnapshot();
}

//changes colour of foreground
function changeColor(){
	foregroundColor = document.getElementById("fgColour").value;
    document.getElementById("overlay-colour").style.backgroundColor = foregroundColor;
    
    //timeout required as there is a brief lag
    setTimeout(getSnapshot, 100);
}

document.getElementById("sizeRange").oninput = changeSize;
document.getElementById("fgColour").oninput = changeColor;

//creates a snapshot of canvas to create preview image + uses if for download
function getSnapshot() {
	link=document.createElement("a");
	link.style.visibility = "hidden";
	link.crossOrigin = '*';
    link.href=canvas.toDataURL('image/jpg');   //function blocks CORS
	document.getElementById("snapshotImg").src = canvas.toDataURL('image/jpg');
}

//function to download image
function downloadSnapshot() {
	getSnapshot();
	link.download = 'screenshot.jpg';
    link.click();
}

function closeModal() {
	document.getElementById("myModal").style.display = "none";
	inEdit = false;
}

function openModal(){
	document.getElementById("myModal").style.display = "block";	
	getSnapshot();
}
