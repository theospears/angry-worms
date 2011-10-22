$(function(){
	var TICK_INTERVAL = 1000; // ms
	var GRAVITY_STRENGTH = 1;

	var canvasRenderer=function() {
		var canvas = document.getElementById('gameworld');
		var drawingContext = canvas.getContext('2d');

		return {
			'draw' : function(world) {
				drawingContext.fillStyle = 'wheat';
				drawingContext.fillRect(0,0,world.size.width, world.size.height);

				for(var i = 0; i < world.contents.length; i++) {
					var obj = world.contents[i];

					switch(obj.style)
					{
						case 'bird':
							drawingContext.fillStyle = 'red';

							drawingContext.beginPath();
							drawingContext.arc(obj.position.x, obj.position.y, obj.size.radius, 0, 2*Math.PI);
							drawingContext.fill();
							drawingContext.closePath();
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
		"size" : { "width" : 500, "height" : 500 },
		"contents" : [
			{
				'position' : { 'x': 50, 'y': 50 },
				'size' : { 'radius' : 25 },
				'style': 'bird',
				'pinned' : false,
				'velocity' : { x: 5, y: 0 }
			},
			{
				'position' : { 'x': 10, 'y': 75 },
				'size' : { 'width': 300, 'height': 10 },
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
