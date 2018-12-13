window.addEventListener('load', function(e) { setCanvasSize(); initRender(); });
window.addEventListener('resize', function(e) {setCanvasSize(); initRender(); });

var gameId = null;

socket = io();

var area = null;
var ctx = null;
var raf = null;
var activateControls = false;

socket.on('connect', function(){
	console.log("Connected to server.");
});

function setCanvasSize(){
	area = document.getElementById('c');
	br = area.getBoundingClientRect();
	area.width = br.width;
	area.height = br.height;
}

function doodle(){
	area = document.getElementById('c');
	ctx = area.getContext('2d');
	ctx.lineWidth = 10;
	ctx.moveTo(0,0);
	ctx.lineTo(100,100);
	ctx.lineTo(100,50);
	ctx.closePath();
	ctx.stroke();
}

function registerGame(){
	playerName = document.getElementById('player');
	playerName.readOnly = true;
	socket.emit('join', {player: playerName.value});
}

socket.on('wait', function(){
	elem = document.getElementById('status');
	elem.innerHTML = "Waiting for an oponent...";
	elem = document.getElementById('inForm');
	elem.style.display = 'none';
	console.log("Waiting for another player!");
});

myStats = null;

socket.on('go', function(data){
	gameId = data.gameId;
	elem = document.getElementById('overlay');
	elem.style.display = 'none';
	console.log(data);
	//initRender();
	if (data.playerTurn == socket.id){
		activateControls = true;
	}
	myStats = data.stats[socket.id];
	console.log("We are ready to start!");
});

socket.on('aim', function(data) {
	launchAngle = Math.PI - data.angle;
	launchPower = data.power;
	opLine.dx = opLine.x + Math.cos(launchAngle) * arena.side * launchPower;
	opLine.dy = opLine.y - Math.sin(launchAngle) * arena.side * launchPower;
});


/* RENDER ENGINE */
var emitUpdate = true;
window.setInterval(()=>{emitUpdate = !emitUpdate}, 100);

function initRender(){
	area = document.getElementById('c');
	ctx = area.getContext('2d');
	raf = window.requestAnimationFrame(draw);

	calculateArena();
	line.x = line.dx = arena.x;
	line.y = line.dy = arena.y + arena.height;

	opLine.x = opLine.dx = arena.x + arena.width;
	opLine.y = opLine.dy = arena.y + arena.height;

	area.addEventListener('resize', function(e){
		calculateArena();
	});
	area.addEventListener('mousemove', function(e) { 
		if (!activateControls){
			return;
		}
		br = area.getBoundingClientRect();
		line.dx = e.clientX - br.x; 
		line.dy = e.clientY - br.y;
		
		launchAngle = calculateLaunchAngle(line);
		lineLen = distanceBetween(line.x, line.y, line.dx, line.dy);

		if (lineLen > arena.side){
			//Trim the line
			line.dx = line.x + Math.cos(launchAngle) * arena.side;
			line.dy = line.y - Math.sin(launchAngle) * arena.side;
			lineLen = arena.side;
		} 	

		if (emitUpdate || true){
			launchPower = lineLen/arena.side;
			socket.emit('aim', {
				id 	  : socket.id,
				gameId: gameId,
				angle : launchAngle,
				power : launchPower,
			});
		}
	});
	area.addEventListener('click', function(e) {
		if (activateControls){
			launchAngle = calculateLaunchAngle(line);
			launchPower = Math.sqrt(line.dx*line.dx + line.dy*line.dy) / arena.side;
			
			socket.emit('fire', {
				id 	  : socket.id,
				gameId: gameId,
				angle : launchAngle,
				power : launchPower,
			});
			activateControls = false;
		}
	});
}

function distanceBetween(ax, ay, bx, by){
		return Math.sqrt((bx-ax) * (bx-ax) + (by-ay) * (by-ay));
}
function calculateLaunchAngle(targetLine){
	launchAngle = 0.0;
	if (Math.abs(targetLine.dx) < 0.0000001){
		launchAngle = Math.PI/2;
	} else {
		slope = (targetLine.y-targetLine.dy)/targetLine.dx;
		launchAngle = Math.atan(slope);
	}
	return launchAngle;
}

function calculateArena() {
	arena.side = area.height;
	if (2 * arena.side > area.width){
		arena.side = area.width/2;
	}
	arena.x = (area.width - 2*arena.side)/2;
	arena.y = (area.height - arena.side)/2;
	arena.width = 2 * arena.side;
	arena.height = arena.side;
}

function draw(){
	clear();
	line.draw();
	opLine.draw();
	arena.draw();
	target.draw();
	raf = window.requestAnimationFrame(draw);
}

function clear(){
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,area.width, area.height);
}


var line = {
	x : 0,
	y : 0,
	dx : 100,
	dy : 100,
	draw: function() {
		ctx.lineWidth = 5;
		ctx.strokeStyle = "rgb(13,173,101)";
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.dx, this.dy);
		ctx.stroke();
	}
};

var opLine = {
	x : 0,
	y : 0,
	dx : 100,
	dy : 100,
	draw: function() {
		ctx.lineWidth = 5;
		ctx.strokeStyle = 'gray';
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.dx, this.dy);
		ctx.stroke();
	}
};
var target = {
	x : 0,
	y : 0,
	radius : 0,
	draw: function() {
		ctx.beginPath();
	    ctx.arc(
	    	this.x * arena.side, 
	    	this.y * arena.side, 
	    	this.radius * arena.side, 
	    	0, Math.PI * 2, true);
	    ctx.closePath();
	    ctx.fillStyle = 'red';
	    ctx.fill();
	}
};
var arena = {
	side : 0,
	x : 0,
	y : 0,
	width : 0,
	height : 0,
	draw : function() {
		ctx.lineWidth = 2;
		ctx.strokeStyle = "black";
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}
};

