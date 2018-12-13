window.addEventListener('load', function(e) {
  setCanvasSize();
  initRender();
});
window.addEventListener('resize', function(e) {
  setCanvasSize();
  initRender();
});

socket = io();

var area = null;
var ctx = null;
var raf = null;
var activateControls = false;

socket.on('connect', function() {
  console.log("Connected to server.");
});

function setCanvasSize() {
  area = document.getElementById('c');
  br = area.getBoundingClientRect();
  area.width = br.width;
  area.height = br.height;
}

function registerGame() {
  playerName = document.getElementById('player');
  playerName.readOnly = true;
  socket.emit('join', {
    player: playerName.value
  });
  elem = document.getElementById('inForm');
  elem.style.display = 'none';
}

socket.on('wait', function() {
  elem = document.getElementById('status');
  elem.innerHTML = "Waiting for an oponent...";
  console.log("Waiting for another player!");
});


socket.on('go', function(data) {
  gameId = data.gameId;
  elem = document.getElementById('overlay');
  elem.style.display = 'none';
  console.log(data);
  if (data.playerTurn == socket.id) {
    activateControls = true;
  }
  if (data.firstPlayer != socket.id) {
    data.target.x = 2.0 - data.target.x;
  }
  target.x = data.target.x * arena.side + arena.x;
  target.y = arena.y + arena.height - data.target.y * arena.side;
  target.radius = data.target.radius * arena.side;
  
  
});

socket.on('aim', function(data) {
  launchAngle = Math.PI - data.angle;
  launchPower = data.power;
  opLine.dx = opLine.x + Math.cos(launchAngle) * arena.side * launchPower;
  opLine.dy = opLine.y - Math.sin(launchAngle) * arena.side * launchPower;
});

socket.on('win', function() {
  elem = document.getElementById('status');
  elem.innerHTML = "You win!";
  elem = document.getElementById('overlay');
  elem.style.display = 'block';
});

socket.on('lost', function() {
  elem = document.getElementById('status');
  elem.innerHTML = "You lost!";
  elem = document.getElementById('overlay');
  elem.style.display = 'block';
})


/* RENDER ENGINE */
var emitUpdate = true;
window.setInterval(() => {
  emitUpdate = !emitUpdate
}, 100);

function initRender() {
  area = document.getElementById('c');
  ctx = area.getContext('2d');
  raf = window.requestAnimationFrame(draw);

  calculateArena();
  line.x = line.dx = arena.x;
  line.y = line.dy = arena.y + arena.height;

  opLine.x = opLine.dx = arena.x + arena.width;
  opLine.y = opLine.dy = arena.y + arena.height;

  area.addEventListener('resize', function(e) {
    calculateArena();
  });
  area.addEventListener('mousemove', function(e) {
    if (!activateControls) {
      return;
    }
    br = area.getBoundingClientRect();
    line.dx = e.clientX - br.x;
    line.dy = e.clientY - br.y;

    launchAngle = calculateLaunchAngle(line);
    lineLen = distanceBetween(line.x, line.y, line.dx, line.dy);

    if (lineLen > arena.side) {
      //Trim the line
      line.dx = line.x + Math.cos(launchAngle) * arena.side;
      line.dy = line.y - Math.sin(launchAngle) * arena.side;
      lineLen = arena.side;
    }

    if (emitUpdate || true) {
      launchPower = lineLen / arena.side;
      socket.emit('aim', {
        id: socket.id,
        gameId: gameId,
        angle: launchAngle,
        power: launchPower,
      });
    }
  });
  area.addEventListener('click', function(e) {
    if (activateControls) {
      launchAngle = calculateLaunchAngle(line);
      launchPower = Math.sqrt(line.dx * line.dx + line.dy * line.dy) / arena.side;

      socket.emit('fire', {
        id: socket.id,
        gameId: gameId,
        angle: launchAngle,
        power: launchPower,
      });
      projectile.set({
        'launchPower': launchPower,
        'launchAngle': launchAngle
      });
      projectile.started = true;
      activateControls = false;
    }
  });
}

function distanceBetween(ax, ay, bx, by) {
  return Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
}

function calculateLaunchAngle(targetLine) {
  launchAngle = 0.0;
  if (Math.abs(targetLine.dx) < 0.0000001) {
    launchAngle = Math.PI / 2;
  } else {
    slope = (targetLine.y - targetLine.dy) / targetLine.dx;
    launchAngle = Math.atan(slope);
  }
  return launchAngle;
}

function calculateArena() {
  arena.side = area.height;
  if (2 * arena.side > area.width) {
    arena.side = area.width / 2;
  }
  arena.x = (area.width - 2 * arena.side) / 2;
  arena.y = (area.height - arena.side) / 2;
  arena.width = 2 * arena.side;
  arena.height = arena.side;
}

function draw() {
  clear();
  arena.draw();
  line.draw();
  opLine.draw();
  target.draw();
  projectile.draw();
  raf = window.requestAnimationFrame(draw);
}

function clear() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, area.width, area.height);
}


var line = {
  x: 0,
  y: 0,
  dx: 100,
  dy: 100,
  draw: function() {
    ctx.lineWidth = 5;
    if (!activateControls) {
      ctx.strokeStyle = 'gray';
    } else {
      ctx.strokeStyle = "rgb(13,173,101)";
    }
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.dx, this.dy);
    ctx.stroke();
  }
};

var opLine = {
  x: 0,
  y: 0,
  dx: 100,
  dy: 100,
  draw: function() {
    ctx.lineWidth = 5;
    if (!activateControls) {
      ctx.strokeStyle = 'black';
    } else {
      ctx.strokeStyle = 'gray';
    }
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.dx, this.dy);
    ctx.stroke();
  }
};
var target = {
  x: 0,
  y: 0,
  radius: 0,
  draw: function() {
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.radius,
      0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
  }
};

function sqDist(a, b){
	return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
}

var projectile = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  maxVel: 30,
  radius: 0.02,
  dt: 1,
  started: false,
  checkFrameCounter : 0,
  draw: function() {

	// do the actual drawing
	console.log('drawing');
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.radius,
      0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();

    if (!this.started) {
      return;
    }
    //calc new speed
	d = sqDist(projectile, target);
	if (d < 3 * target.radius * target.radius){
		//we have a hit!
		socket.emit('hit', {id: socket.id , gameId : gameId});
		this.started = false;
	}
    //this.checkFrameCounter++;
    this.vy = this.vy + 9.8/60 * this.dt;

    //calc new position
    this.x = this.x + this.vx * this.dt;
    this.y = this.y + this.vy * this.dt;

    if (this.x > (arena.x + 2.0*arena.width) || this.y > (arena.y + arena.height)) {
      this.started = false;
      socket.emit('miss', {id:socket.id, gameId:gameId});
    }
  },
  reset: function() {
    this.x = this.y = this.vx = this.vy = 0;
    started = false;
  },
  set: function(launchParams) {
    this.x = line.x;
    this.y = line.y;
    this.radius = target.radius/2.0;
    //this.x = 200;
    //this.y = 200;

    this.vx = launchParams.launchPower * this.maxVel * Math.cos(launchParams.launchAngle);
    this.vy = -1 * (1-launchParams.launchPower) * this.maxVel * Math.sin(launchParams.launchAngle);

    //this.vx = 0;
    //this.vy = 0;
  },
};
var arena = {
  side: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  draw: function() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
};