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

(function($){

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
            transformPrefix: prefix.css + 'transform'
        }, options || {});

		this.$el = $('<div />')
					.addClass('snow')
					.css({'position':'fixed'});

		this.opts.parent.$el.append(this.$el);

		this.startX = this.opts.parent.edges().width * Math.random();
		this.x = 0;
		this.y = 0;
		this.speed = Math.random() * 1 + 1;

		this.wiggle = {
			count: 0,
			factor: Math.random() * 50 + 50,
			speed: 0.01 + Math.random() / 1000
		}

		this.translate(this.startX, this.y);

		this.init();
	}
	
	Snow.prototype = { 
		constructor: Snow,
		init:function(){
			this.setDimensions();
		},
		setDimensions:function(){
			var dim = parseInt( (Math.random() * this.opts.dimension.max) + this.opts.dimension.min); 

			this.$el.width(dim);
			this.$el.height(dim);
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
				this.y = (this.$el.height() * 2) * -1;
			}else{
				this.y += this.speed;
			}
		},

	};
	
	window.Snow = Snow;

	/*
	* Snow Collection
	*/
	function SnowStorm(options){
		this.opts = $.extend(true, {}, {
            dimension:{
            	min:8,
            	max:15
            },
            parent: this
        }, options || {});

		this.opts.dimension.max = this.opts.dimension.max - this.opts.dimension.min;
		
		this.collection = [];
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
			for (var i = 0; i < 20; i++) {
				this.collection.push(new Snow(this.opts));
			};		
		},
		edges:function(){
			return {
				width:this.$window.width(),
				height:this.$window.height(),
			}
		},
		start:function(){
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
			for (var i = 0; i < this.collection.length; i++) {
				this.collection[i].render();
			};
		}
	};
	
	window.SnowStorm = SnowStorm;

	$(document).ready(function(){
		var snowStorm = new SnowStorm();	
	});
}(jQuery))



