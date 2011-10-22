$(function(){
	var RENDER_DEBUG = false

	var TICK_INTERVAL = 50; // ms
	var GRAVITY_STRENGTH = 0.1;
	var BACKGROUND_PATH = [ 'images/background.png' ]
	var BIRD_IMAGE_PATHS = [ 'images/bird-yellow.png', 'images/bird-blue.png' ];

	var canvasRenderer=function() {
		var canvas = document.getElementById('gameworld');
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
			'draw' : function(world) {
				drawingContext.drawImage(background, 0, 0);

				for(var i = 0; i < world.contents.length; i++) {
					var obj = world.contents[i];

					switch(obj.style)
					{
						case 'bird':
							var image = birdImages[obj.player];
							drawingContext.drawImage(image, obj.position.x - image.width / 2, obj.position.y - image.height / 2);
							break;

						case 'brick':
							if(RENDER_DEBUG) {
								drawingContext.fillStyle = 'green'
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
				'position' : { 'x': 0, 'y': 570 },
				'size' : { 'width': 800, 'height': 30 },
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
