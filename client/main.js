$(function(){
	var TICK_INTERVAL = 1000; // ms

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
		return {
			'tick' : function(world) {
				var newContents = [];
				for(var i = 0; i < world.contents.length; i++) {
					var obj = world.contents[i];
					newContents.push(obj);
				}

				return {
					'size' : world.size,
					'contents' : newContents
				}
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
				'pinned' : false
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
