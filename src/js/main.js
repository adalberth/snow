// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function($,p5){

	


	/*
	* Prefix
	*/
	var prefix = (function () {
	  var styles = window.getComputedStyle(document.documentElement, ''),
	    pre = (Array.prototype.slice
	      .call(styles)
	      .join('') 
	      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
	    )[1],
	    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
	  return {
	    dom: dom,
	    lowercase: pre,
	    css: '-' + pre + '-',
	    js: pre[0].toUpperCase() + pre.substr(1)
	  };
	})();

	/*
	* Snow
	*/
	function Snow(options){
		this.opts = $.extend(true, {}, {
            transformPrefix: prefix.css + 'transform',
            wiggle:{
				count: 0,
				factor: Math.random() * 50 + 50,
				speed: 0.01 + Math.random() / 1000
			}
        }, options || {});

		this.$el = $('<div />')
					.addClass('snow')
					.css({
						'position':'fixed',
						'z-index': this.randomZindex(),
						'opacity': this.randomOpacity()
					});

		this.opts.parent.$el.append(this.$el);

		this.init();
	}
	
	Snow.prototype = { 
		constructor: Snow,
		init:function(){
			this.setDimensions();
			this.variables();
		},
		setDimensions:function(){
			var dim = parseInt( (Math.random() * this.opts.dimension.max) + this.opts.dimension.min); 

			this.$el.width(dim);
			this.$el.height(dim);
		},
		setStartPosition:function(){
			this.startX = this.opts.parent.edges().width * Math.random();
			this.y = (this.$el.height() * 3) * -1;
		},
		variables:function(){
			this.x = 0;
			this.y = 0;
			this.speed = Math.random() * 2 + 1;

			this.wiggle = this.opts.wiggle;

			this.setStartPosition();

			this.translate(this.startX, this.y);
		},
		render:function(){
			this.animate();
			this.edge();
		},
		animate:function(){
			this.translate(this.x,this.y);
		}, 
		translate:function(x,y){
			var transform = this.opts.transformPrefix;
			this.$el.css({
				 transform : 'translate3D('+x+'px, '+y+'px, 0px)'
			})
		},
		edge:function(){
			var edges = this.opts.parent.edges();
			
			this.wiggle.count += this.wiggle.speed;

			// if(this.x > edges.width){
			// 	this.x = 0;
			// }else{	
			// }

			this.x = (Math.sin(this.wiggle.count) * this.wiggle.factor) + this.startX;

			if(this.y > edges.height){
				this.setStartPosition();
			}else{
				this.y += this.speed;
			}
		},
		randomZindex:function(){
			return (Math.floor(Math.random() * 9) + 1).toString();
		},
		randomOpacity:function(){
			var min = 6,
				max = 9;
		  return ((Math.floor(Math.random() * (max - min)) + min) / 10).toString();
		}

	};
	
	window.Snow = Snow;

	/*
	* Snow Collection
	*/
	function SnowStorm(options){
		this.opts = $.extend(true, {}, {
            snow:{
            	dimension:{
	            	min:5,
	            	max:10
	            },
	            parent: this
            },
            children:50
        }, options || {});

		this.opts.snow.dimension.max = this.opts.snow.dimension.max - this.opts.snow.dimension.min;
		
		this.collection = [];
		this.animationCollection = [];
		this.$window = $(window);
		this.init();
	}
	
	SnowStorm.prototype = { 
		constructor: SnowStorm,
		init:function(){
			this.createParent();
			this.createSnow();
			this.start();
		},
		createParent:function(){
			this.$el = $('<div />').addClass('snowStorm');
			$('body').append(this.$el);
		},
		createSnow:function(){
			for (var i = 0; i < this.opts.children; i++) {
				this.collection.push(new Snow(this.opts.snow));
			};		
		},
		edges:function(){
			return {
				width:this.$window.width(),
				height:this.$window.height(),
			}
		},
		start:function(){ 

			var that = this;
			this.interval = setInterval(function(){
				that.animationCollection.push(that.collection[that.animationCollection.length]);
				if(that.animationCollection.length === that.collection.length){
					clearInterval(that.interval);
				}
			},250);

			this.render();
		},
		render:function(){
			var that = this;
			requestAnimFrame(function(){
				that.render();
			});
			that.loop();
		},
		loop:function(){
			for (var i = 0; i < this.animationCollection.length; i++) {
				this.animationCollection[i].render();
			}; 
		}
	};
	
	window.SnowStorm = SnowStorm;

	$(document).ready(function(){
		var snowStorm = new SnowStorm();	
	});
}(jQuery, p5))



