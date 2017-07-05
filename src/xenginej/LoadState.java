/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package xenginej;

import engine.actors.Sprite;
import engine.managers.state.EngineState;
import engine.core.Game;
import engine.core.SignalBinding;

/**
 *
 * @author XiscoFerrer
 */
public class LoadState extends EngineState{

    protected LoadState(Game game) {
        super(game);
    }
    private Sprite sprite1;
    private Sprite sprite2;
    @Override
    public void preload() {
        SignalBinding bind =new SignalBinding(false) {
            @Override
            public void callBinding(Object... args) {
                System.out.println(args[0]);
            }
        }; 
        gameRef.getLoader().addImage("button", "resources/ButtonOrange.png");
        gameRef.getLoader().getOnFileComplete().addBinding(bind);
    }    

    @Override
    public void start() {
        sprite1 = gameRef.getActorFactory().addSprite("button", 50, 50);
        sprite2 = gameRef.getActorFactory().addSprite("button", 400, 400);
        sprite1.anchor.setTo(0.5f);
        sprite2.anchor.setTo(0.5f);
    }

    @Override
    public void update(float deltaTime) {
        sprite1.rotation += 5 * deltaTime;
        sprite2.rotation -= 5 * deltaTime;
    }
}
