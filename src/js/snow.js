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
            transformPrefix: prefix.css + 'transform',
            wiggle:{
				count: 0,
				factor: Math.random() * 50 + 50,
				speed: 0.01 + Math.random() / 1000
			}
        }, options || {});

		this.$el = $('<div />')
					.addClass('snow falling')
					.css({
						'position':'fixed', 
						'opacity': this.randomOpacity()
					});

		var graphic = $('<div />')
					.addClass('snow-graphic');

		this.$el.append(graphic);

		this.opts.parent.$el.append(this.$el);

		this.init(); 
	}
	
	Snow.prototype = { 
		constructor: Snow,
		init:function(){
			this.setDimensions();
			this.setZindex();
			this.variables();
		},
		setDimensions:function(){
			var dim = this.randomDimension();
				diff = dim > this.opts.dimension.min + 1 ? parseInt(Math.random() * 2) : 0;
			this.$el.width(dim);
			this.$el.height(dim - diff);
		},
		setStartPosition:function(){
			this.startX = this.opts.parent.edges().width * Math.random();
			this.y = this.heightOffset * -1;
			this.setZindex();
			this.setSpeed();
		},
		setZindex:function(){
			this.zIndex = this.randomZindex();
			this.$el.css({
						'z-index': this.zIndex,
					});
		},
		setSpeed:function(){
			this.speed = Math.random() * 2 + 1;
		},
		variables:function(){
			this.x = 0;
			this.y = 0;
			this.wiggle = this.opts.wiggle;
			this.heightOffset = (this.$el.height() * 3);

			this.setStartPosition();

			this.translate(this.startX, this.y);
		},
		render:function(){
			this.animate();
			this.touch();
			this.edge();
		},
		animate:function(){
			this.translate(this.x,this.y); 
		},
		start:function(){
			this.$el.addClass('falling');
			this.$el.removeClass('stopped');
		},	
		stop:function(){
			this.$el.removeClass('falling');
			this.$el.addClass('stopped');
			this.opts.parent.removeFromAnimation(this);
		}, 
		translate:function(x,y){
			var transform = this.opts.transformPrefix;
			this.$el.css({
				 transform : 'translate3D('+x+'px, '+y+'px, 0px)'
			})
		},
		touch:function(){
			for (var i = 0; i < this.opts.parent.colliderCollection.length; i++) {
				var touch = this.opts.parent.colliderCollection[i].touch(this);
				if(touch) this.stop();
			};
		},
		edge:function(){ 
			var edges = this.opts.parent.edges();
			
			this.wiggle.count += this.wiggle.speed;
			this.x = (Math.sin(this.wiggle.count) * this.wiggle.factor) + this.startX;

			if(this.y > (edges.height + this.heightOffset)){
				this.setStartPosition();
			}else{
				this.y += this.speed;
			}
		},
		randomDimension: function(){
			return parseInt( (Math.random() * this.opts.dimension.max) + this.opts.dimension.min);
		},
		randomZindex:function(){
			return (Math.floor(Math.random() * 9) + 1).toString();
		},
		randomOpacity:function(){
			var min = 8,
				max = 10;
		  return ((Math.floor(Math.random() * (max - min)) + min) / 10).toString();
		}

	};
	
	window.Snow = Snow;

	/*
	* Snow Colliders
	*/
	function SnowCollider(options){
		this.opts = $.extend(true, {}, {
        }, options || {});

        this.el = this.opts.el;
        this.$el = $(this.el);
        this.zIndex = this.$el.css('z-index') === 'auto' ? 0 : this.$el.css('z-index');
        this.body = this.getBody();
        this.touchCollection = [];

		this.init();
	}
	
	SnowCollider.prototype = { 
		constructor: SnowCollider,
		init:function(){
			//this.bind();
		},
		bind:function(){
			this.$el.on('click',$.proxy(this.shake,this));
		},
		shake:function(){
			for (var i = 0; i < this.touchCollection.length; i++) {
				this.touchCollection[i].start();
				this.opts.parent.addToAnimation(this.touchCollection[i]);
			};
			this.touchCollection = [];
		},
		getBody:function(){
			var top = this.$el.offset().top - this.opts.parent.edges().scroll;
			return {
		        top: top,
		        right: this.$el.offset().left + this.$el.width() - 10,
		        bottom: top + 1, //this.$el.height(),
		        left: this.$el.offset().left,
	        };
		},
		setBody:function(){
			this.body = this.getBody();
		},
		touch:function(el){

			if(el.y > this.body.top 
			&& el.y < this.body.bottom
			&& el.x > this.body.left
			&& el.x < this.body.right
			&& el.zIndex >= this.zIndex){

				this.touchCollection.push(el);
				return true;
			}

			return false;
		}
	};
	
	window.SnowCollider = SnowCollider;

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
            $collider:$('.collider'),
            children:50,
            maxChildren:200,
            snowBeginTimer:200,
        }, options || {});

		this.opts.snow.dimension.max = this.opts.snow.dimension.max - this.opts.snow.dimension.min;
		
		this.collection = [];
		this.colliderCollection = [];
		this.animationCollection = [];
		this.$window = $(window);
		this.$hmtlbody = $('html,body');

		this.canremove = false;
		this.init();
	}
	
	SnowStorm.prototype = { 
		constructor: SnowStorm, 
		init:function(){
			this.createParent();
			this.createSnow();
			this.createCollider();
			this.bind();
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
		createCollider:function(){
			var that = this;
			this.opts.$collider.each(function(i,el){
				that.colliderCollection.push(new SnowCollider({el:el,parent:that}));
			});
		},
		bind:function(){
			this.$window.scroll($.proxy(this.scroll,this));
		},
		scroll:function(){
			this.refreshCollider();
		},
		refreshCollider:function(){
			for (var i = 0; i < this.colliderCollection.length; i++) {
				this.colliderCollection[i].shake();
				this.colliderCollection[i].setBody();
			};
		},
		addSnow:function(){
			if(this.collection.length >= this.opts.maxChildren) return;
			var snow = new Snow(this.opts.snow);
			this.collection.push(snow);
			this.addToAnimation(snow);
		},
		edges:function(){
			var scroll = this.$window.scrollTop();
			return {
				width:this.$window.width(),
				height:this.$window.height(),
				scroll: scroll > 0 ? scroll : 0
			}
		},
		start:function(){ 
			var that = this;
			this.interval = setInterval(function(){
				that.animationCollection.push(that.collection[that.animationCollection.length]);
				if(that.animationCollection.length === that.collection.length){
					that.canremove = true;
					clearInterval(that.interval);
				}
			},this.opts.snowBeginTimer);

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
		},
		removeFromAnimation:function(el){
			if(!this.canremove) return;
			if(this.removeItem(el)) this.addSnow();
		},
		removeItem:function(el){
			var index = this.animationCollection.indexOf(el);
			if (index > -1) {
				this.animationCollection.splice(index, 1);
				return true;
			}

			return false;
		},
		addToAnimation:function(el){
			var index = this.animationCollection.indexOf(el);
			if (index === -1) {
				this.animationCollection.push(el);
			}
		},
		snowControl:function(){
			// Remove snow if to manny
		}
	};
	
	window.SnowStorm = SnowStorm; 

	$(document).ready(function(){
		var snowStorm = new SnowStorm();	
	});
}(jQuery))



