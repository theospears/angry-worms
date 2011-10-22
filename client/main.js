$(function(){
	var RENDER_DEBUG = false

	var TICK_INTERVAL = 50; // ms
	var GRAVITY_STRENGTH = 0.005 * TICK_INTERVAL;
	var BACKGROUND_PATH = [ 'images/background.png' ]
	var BIRD_IMAGE_PATHS = [ 'images/bird-yellow.png', 'images/bird-blue.png' ];
	var MAX_THROW_SPEED = 20;
	var OFFSET_MULTIPLE = 3;
	var TARGET_SIZE = 15;

	var canvasRenderer=function(canvas, world) {
		var drawingContext = canvas.getContext('2d');

		var birdImages = [];

		for(var i = 0; i < BIRD_IMAGE_PATHS.length; i++) {
			var img = new Image();
			img.src = BIRD_IMAGE_PATHS[i];
			birdImages.push(img);
		}

		var background = new Image();
		background.src = BACKGROUND_PATH;

		console.log(birdImages);

		return {
			'draw' : function() {
				drawingContext.drawImage(background, 0, 0);

				for(var i = 0; i < world.contents.length; i++) {
					var obj = world.contents[i];

					switch(obj.style)
					{
						case 'bird':
							var image = birdImages[obj.player];
							drawingContext.drawImage(image, obj.position.x - image.width / 2, obj.position.y - image.height / 2);

							if(obj.target) {
								// Target circle
								console.log(obj.target);
								drawingContext.strokeStyle = 'red';
								drawingContext.beginPath();
								drawingContext.arc(obj.target.x, obj.target.y, TARGET_SIZE, 0, Math.PI*2);
								drawingContext.stroke();
								drawingContext.closePath();
								
								// line to it
								drawingContext.strokeStyle = 'red';
								drawingContext.beginPath();
								drawingContext.moveTo(obj.target.x, obj.target.y)
								drawingContext.lineTo(obj.position.x, obj.position.y);
								drawingContext.stroke();
								drawingContext.closePath();
							}

							break;

						case 'brick':
							if(RENDER_DEBUG) {
								drawingContext.fillStyle = 'green';
								drawingContext.fillRect(obj.position.x,obj.position.y,obj.size.width,obj.size.height);
							}
							break;

						default:
							throw new Exception("Oop");
					}
				}
			}
		}
	}

	var physicsEngine = function(world) {

		var collisionAlgorithms = {
			'bird/bird' : function(bird1, bird2) {
				var displacement = { x : bird1.position.x - bird2.position.x, y : bird1.position.y - bird2.position.y };
				distance = Math.sqrt(displacement.x * displacement.x + displacement.y * displacement.y);
				if(distance < bird1.size.radius + bird2.size.radius) {
					return { normal:  Math.atan(displacement.y / displacement.x) };
				} else {
					return false;
				}
			},
			'bird/brick' : function(bird, brick) {
				var hit = Math.abs(bird.position.y - brick.position.y) < 35;
				if(hit) {
					return { normal: Math.PI / 2 };
				} else {
					return false;
				}
		 	}
		}

		var getCollisionInformation = function(object1, object2) {
			var formerObject = object1.style < object2.style ? object1 : object2;
			var latterObject = object1.style < object2.style ? object2 : object1;

			var collisionFunc = collisionAlgorithms[formerObject.style + '/' + latterObject.style];
			return collisionFunc(formerObject, latterObject);
		}

		return {
			'tick' : function() {
				for(var i = 0; i < world.contents.length; i++) {
					var obj = world.contents[i];
					if(!obj.pinned) 
					{
						// gravity
						obj.velocity.y += GRAVITY_STRENGTH;

						// movement
						obj.position.x += obj.velocity.x;
						obj.position.y += obj.velocity.y;

					}

					// Collision detection
					for(var cc = 0; cc < i; cc++) {
						var collisionCandidate = world.contents[cc];

						var colInfo = getCollisionInformation(obj, collisionCandidate);
						if(colInfo) {
							console.log("Hit!");
							if(! obj.pinned) {
								obj.velocity.y = - obj.velocity.y;
							}
							if(! collisionCandidate.pinned) {
								collisionCandidate.velocity.y = - collisionCandidate.velocity.y;
							}
						}
					}
				}
			}
		};
	}

	var inputHandler = function(canvas,world) {
		var world;
		var $canvas = $(canvas);
		var grabbedObject = null;
		var grabPosition;

		var getMagnitude = function(displacement) {
			return Math.sqrt(displacement.x * displacement.x + displacement.y * displacement.y);
		}

		var getDistance = function(point1, point2) {
			var displacement = { x : point1.x - point2.x, y : point1.y - point2.y };
			return getMagnitude(displacement);
		}



		$canvas.mousedown(function(ev) {
			console.log(ev.offsetX, ev.offsetY);
			window.it = ev;
			
			var mouseDownPosition = {x:ev.offsetX, y:ev.offsetY};
			// Check if the player clicked on one of the birds
			for(var i = 0; i < world.contents.length; i++) {
				var obj = world.contents[i];
				if(obj.style == 'bird' && getDistance(obj.position, {x:ev.offsetX, y:ev.offsetY}) < obj.size.radius) {
					console.log('Grabbed the bird');
					obj.velocity.x = 0;
					obj.velocity.y = 0;

					obj.target = mouseDownPosition;

					obj.pinned = true;
					grabbedObject = obj;
					grabPosition = mouseDownPosition;
				}
			}
			return true;
		});

		$canvas.mouseup(function(ev) {
			var mousePosition = {x:ev.offsetX, y:ev.offsetY};
			
			if(grabbedObject) {
				console.log('Dropped the bird');

				var newVelocity = {
					x: (grabPosition.x - mousePosition.x) /  OFFSET_MULTIPLE,
					y: (grabPosition.y - mousePosition.y) / OFFSET_MULTIPLE
				};
				speed = getMagnitude(newVelocity);

				if(speed > MAX_THROW_SPEED) {
					newVelocity = {
						x: newVelocity.x * MAX_THROW_SPEED / speed,
						y: newVelocity.y * MAX_THROW_SPEED / speed
					};
				}

				grabbedObject.velocity = newVelocity;

				grabbedObject.pinned = false;
				delete grabbedObject.target;
				grabbedObject = null;
			}
		});

		$canvas.mousemove(function(ev) {
			var mousePosition = {x:ev.offsetX, y:ev.offsetY};
			
			if(grabbedObject) {

				var offset = { x: grabPosition.x - mousePosition.x, y: grabPosition.y - mousePosition.y };
				offsetMagnitude = getMagnitude(offset);

				if(offsetMagnitude > MAX_THROW_SPEED * OFFSET_MULTIPLE) {
					offset.x = offset.x * MAX_THROW_SPEED * OFFSET_MULTIPLE / offsetMagnitude;
					offset.y = offset.y * MAX_THROW_SPEED * OFFSET_MULTIPLE / offsetMagnitude;

				}
				grabbedObject.position.x = grabPosition.x - offset.x;
				grabbedObject.position.y = grabPosition.y - offset.y;

			}
		});

		return { 
			'world' : function(newWorld) {
				world = newWorld;
			}
		}
	}

	var world = {
		"size" : { "width" : 800, "height" : 600 },
		"contents" : [
			{
				'position' : { 'x': 50, 'y': 50 },
				'size' : { 'radius' : 25 },
				'style': 'bird',
				'pinned' : false,
				'velocity' : { x: 1, y: 0 },
				'player' : 0
			},
			{
				'position' : { 'x': 450, 'y': 20 },
				'size' : { 'radius' : 25 },
				'style': 'bird',
				'pinned' : false,
				'velocity' : { x: -3, y: 0 },
				'player' : 1
			},
			{
				'position' : { 'x': 0, 'y': 570 },
				'size' : { 'width': 800, 'height': 30 },
				'style': 'brick',
				'pinned' : true
			}
		]
	}

	var canvas = document.getElementById('gameworld');

	var renderer = canvasRenderer(canvas,world );
	var engine = new physicsEngine(world);
	var input = new inputHandler(canvas, world);

	setInterval(function() {
		world = engine.tick();
		renderer.draw();
	}, TICK_INTERVAL);


});
