window.addEventListener('load', function(e) { setCanvasSize(); });
window.addEventListener('resize', function(e) {setCanvasSize(); doodle();});

var gameId = null;

socket = io();

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
	//initRender();
});

socket.on('go', function(data){
	gameId = data.gameId;
	elem = document.getElementById('overlay');
	elem.style.display = 'none';
	console.log(area);
	initRender();
	if (data.playerTurn == socket.id){
		activateControls = true;
	}
	console.log("We are ready to start!");
});

socket.on('srv-update', function(data) {
	//1. verifica daca meciul s-a incheiat
	//2. Simuleaza lovitura
	//3. Muta tinta/tanc-ul
});

/* RENDER ENGINE */
var area = null;
var ctx = null;
var raf = null;
var activateControls = false;

function initRender(){
	area = document.getElementById('c');
	ctx = area.getContext('2d');
	raf = window.requestAnimationFrame(draw);

	calculateArena();
	line.x = arena.x;
	line.y = arena.y + arena.height;
	area.addEventListener('resize', function(e){
		calculateArena();
	});
	area.addEventListener('mousemove', function(e) { 
		line.dx = e.clientX; 
		line.dy = e.clientY; 
	});

	area.addEventListener('click', function(e) {
		if (activateControls){
			socket.emit('fire', {
				gameId: gameId,
				angle : Math.PI/4,
				power : 50,
			});
			activateControls = false;
		}
	});
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
	if (activateControls){
		line.draw();
	}
	arena.draw();
	raf = window.requestAnimationFrame(draw);
}



var line = {
	x : 0,
	y : 0,
	dx : 100,
	dy : 100,
	draw: function() {
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.dx, this.dy);
		ctx.stroke();
	}
};

var arena = {
	side : 0,
	x : 0,
	y : 0,
	width : 0,
	height : 0,
	draw : function() {
		ctx.lineWidth = 10;
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}
};

function clear(){
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,area.width, area.height);
}
