var AnimScene = function (game) {
	
};

AnimScene.prototype = {
	
	preload: function () {
		this.game.load.jsonSpriteSheet('player', 'img/animations.png', 'img/man.json');
		this.game.load.image('back1', 'img/back1.jpg');
		// this.game.load.image('back2', 'img/back2.jpg');
		this.game.load.image('test2', 'img/angry_unicorn.png');
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

        this.game.input.onClick.add(function(){
			this.game.input.onKeyUp._destroy();
			this.game.input.onClick._destroy();
			this.game.state.start('unicorns');
		},this);

		
		// this.text = this.game.add.text(200,200,'Hola Mundo', {font_size: 60});
		// this.text.anchor.setTo(0.5);
		// this.rect = this.game.add.rect(0,0, 0, this.game.height);
		// this.rect.render = false;


		this.unicorn = this.game.add.sprite(200,200, 'test2');
		//this.unicorn.anchor.setTo(0.5);
		//this.unicorn.setColor(0xffffff);
		this.unicorn.render = false;

		// // //this.game.tween.add(this.text.scale).to({x:1.2, y:1.2}, 800, XEngine.Easing.QuadInOut, true, 0, -1, true)
		// // this.text.mask = this.rect;
		// this.game.tween.add(this.rect).to({width:this.game.width}, 2000, XEngine.Easing.ExpoInOut, true, 0, -1, true)


		// this.back2 = this.game.add.sprite(0,0,'back2');
		// this.back2.mask = this.rect;
		this.back1 = this.game.add.sprite(0,0,'back1');
		this.back1.width = 1200;
		this.back1.height = 720;
		//this.back1.scale.setTo(0.5);
		//this.back1.mask = this.unicorn;
	},
	
	update : function (deltaTime) {
		//this.game.camera.position.y += 1.0;
		// this.tilled.offSet.x += 200 * deltaTime;
		// this.tilled.offSet.y += 200 * deltaTime;
		//this.text.rotation += 45*deltaTime;
		this.unicorn.position.x = this.game.input.pointer.x;
		this.unicorn.position.y = this.game.input.pointer.y;
        // var walk = false;
		// if(this.game.input.isPressed(XEngine.KeyCode.D)){
		// 	this.sprite.position.x += 200 * deltaTime;
        //     this.sprite.scale.x = 1.5;
		// 	this.sprite.animation.play('walk');
        //     walk = true;
		// }
		// if(this.game.input.isPressed(XEngine.KeyCode.A)){
		// 	this.sprite.position.x -= 200 * deltaTime;
		// 	this.sprite.animation.play('walk');
        //     this.sprite.scale.x = -1.5;
        //     walk = true;
		// }
		// if(this.game.input.isPressed(XEngine.KeyCode.W)){
		// 	this.sprite.position.y -= 200 * deltaTime;
		// }
		// if(this.game.input.isPressed(XEngine.KeyCode.S)){
		// 	this.sprite.position.y += 200 * deltaTime;
		// }

        // if(!walk){
        //     this.sprite.animation.play('idle');
        // }
	},
	
	fin: function () {
		
	},
};