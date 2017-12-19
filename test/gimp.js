var Gimp = function (game) {
	
};

Gimp.prototype = {
	
	preload: function () {
		this.game.load.image('back', 'img/back2.jpg');
	},
	
	start: function () {
		// this.sprite = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'player');
		// this.sprite.anchor.setTo(0.5);
		// this.sprite.scale.setTo(1.5);
		// this.sprite.animation.add('idle', ['manIdle.0000', 'manIdle.0001', 'manIdle.0002', 'manIdle.0003', 'manIdle.0004', 'manIdle.0005', 'manIdle.0006', 'manIdle.0007', 'manIdle.0008', 'manIdle.0009'], 75, true);
		// this.sprite.animation.add('jump', ['manJump.0002', 'manJump.0003', 'manJump.0004', 'manJump.0005'], 120, false);
		// this.sprite.animation.add('walk',['manWalk.0001', 'manWalk.0002', 'manWalk.0003', 'manWalk.0004', 'manWalk.0005', 'manWalk.0006', 'manWalk.0007', 'manWalk.0008'], 100, true);
		// this.sprite.animation.play('idle');

		//this.tilled = this.game.add.tilled(0,0,'player', 400,400);

        this.game.input.onKeyUp.add(function(event){
            if(event.keyCode == XEngine.KeyCode.TWO){
                this.game.input.onKeyUp._destroy();
			    this.game.input.onClick._destroy();
                this.game.state.start('unicorns');
            }
            if(event.keyCode == XEngine.KeyCode.THREE){
                this.game.input.onKeyUp._destroy();
			    this.game.input.onClick._destroy();
                this.game.state.start('shader');
            }
		},this);

        // this.game.input.onClick.add(function(){
		// 	this.game.input.onKeyUp._destroy();
		// 	this.game.input.onClick._destroy();
		// 	this.game.state.start('unicorns');
		// },this);

		this.back = this.game.add.sprite(50,50,'back');
		this.back.setColor(0xffffff);
		this.back.inputEnabled = true;
		this.back.pickeable = true;
		this.back.shader = XEngine.ShaderLib.Gimp.shader;
		this.time = 0;

		var gui = new dat.GUI();

		controller = gui.add(this.back.shader.uniforms.brightness, 'value', 0, 1);
		var _this = this;
		controller.name('brightness');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.contrast, 'value', 0, 1);
		var _this = this;
		controller.name('contrast');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.hue, 'value', 0, 1);
		var _this = this;
		controller.name('hue');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.saturation, 'value', 0, 10);
		var _this = this;
		controller.name('saturation');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});


		controller = gui.add(this.back.shader.uniforms.inMin, 'value', 0, 1);
		var _this = this;
		controller.name('inMin');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.inMax, 'value', 0, 1);
		var _this = this;
		controller.name('inMax');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.inGamma, 'value', 0, 5);
		var _this = this;
		controller.name('inGamma');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.outMin, 'value', 0, 1);
		var _this = this;
		controller.name('outMin');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.outMax, 'value', 0, 1);
		var _this = this;
		controller.name('outMax');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.distorsion, 'value', 0, 1);
		var _this = this;
		controller.name('distorsion');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		controller = gui.add(this.back.shader.uniforms.blurAmount, 'value', 0, 1);
		var _this = this;
		controller.name('blurAmount');
		controller.listen();
		controller.onChange(function(value){
			_this.onFloatValueChange(this.object, value);
		});

		
	},
	
	update : function (deltaTime) {
		this.time += deltaTime;
		this.back.shader.uniforms.time.value =this.time;
	},

	onFloatValueChange: function (object, value) {
		if(value == 0.0) value = 0.0000001;
		object.value = value;
	},
	
	fin: function () {
		
	},
};