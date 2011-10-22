$(function(){
	var TICK_INTERVAL = 50; // ms
	var GRAVITY_STRENGTH = 0.1;

	var canvasRenderer=function() {
		var canvas = document.getElementById('gameworld');
		var drawingContext = canvas.getContext('2d');

		var birdFiles = [ 'images/bird-yellow.png', 'images/bird-blue.png' ];
		var birdImages = [];

		for(var i = 0; i < birdFiles.length; i++) {
			var img = new Image();
			img.src = birdFiles[i];
			birdImages.push(img);
		}

		console.log(birdImages);

		return {
			'draw' : function(world) {
				drawingContext.fillStyle = 'wheat';
				drawingContext.fillRect(0,0,world.size.width, world.size.height);

				for(var i = 0; i < world.contents.length; i++) {
					var obj = world.contents[i];

					switch(obj.style)
					{
						case 'bird':
							var image = birdImages[obj.player];
							drawingContext.drawImage(image, obj.position.x - image.width / 2, obj.position.y - image.height / 2);
							break;

						case 'brick':
							drawingContext.fillStyle = 'green'
							drawingContext.fillRect(obj.position.x,obj.position.y,obj.size.width,obj.size.height);
							break;

						default:
							throw new Exception("Oop");
					}
				}
			}
		}
	}

	var physicsEngine = function() {
		var deepClone = function(obj) {
			if(obj instanceof Array) {
				var newObj = [];
				newObj.__proto__ = obj.__proto__;
				for(var i = 0; i < obj.length; i++) {
					newObj[i] = deepClone(obj[i]);
				}
				return newObj;
			} else if(obj instanceof Object) {
				var newObj = {}
				newObj.__proto__ = obj.__proto__;
				for(var v in obj) {
					if(obj.hasOwnProperty(v)) {
						newObj[v] = deepClone(obj[v]);
					}
				}
				return newObj;
			} else {
				return obj; // primative
			}
			return obj;
		}

		return {
			'tick' : function(world) {
				var newWorld = deepClone(world);
				for(var i = 0; i < newWorld.contents.length; i++) {
					var obj = newWorld.contents[i];
					if(!obj.pinned) 
					{
						// movement
						obj.velocity.y += GRAVITY_STRENGTH;

						// gravity
						obj.position.x += obj.velocity.x;
						obj.position.y += obj.velocity.y;
					}
				}

				return newWorld;
			}
		};
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
				'velocity' : { x: -1, y: 0 },
				'player' : 1
			},
			{
				'position' : { 'x': 10, 'y': 75 },
				'size' : { 'width': 580, 'height': 10 },
				'style': 'brick',
				'pinned' : true
			}
		]
	}

	var renderer = canvasRenderer();
	var engine = new physicsEngine();

	setInterval(function() {
		world = engine.tick(world);
		renderer.draw(world);
	}, TICK_INTERVAL);


});
