window.addEventListener('load', function(e) { setCanvasSize(); doodle(); });
window.addEventListener('resize', function(e) {setCanvasSize(); doodle();});





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

e = document.getElementById('screen');
