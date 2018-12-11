window.addEventListener('load', function(e) { setCanvasSize(); });
window.addEventListener('resize', function(e) {setCanvasSize(); doodle();});

socket = io();

socket.on('connect', function(){
	console.log("Connected to server.");
})

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
	socket.emit('join', {name: "FIX_ME"});
}

e = document.getElementById('screen');
