/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.core;

import engine.actors.Actor;
import engine.actors.Sprite;

/**
 *
 * @author XiscoFerrer
 */
public class ActorFactory {
    
    private Game gameRef;
    
    public ActorFactory(Game game){
        gameRef = game;
    }
    
    
    public Sprite addSprite(String imageName, int posX, int posY){
        Sprite sprite = new Sprite(gameRef, imageName, posX, posY);
        gameRef.addExistingActor(sprite);
        return sprite;
    }
}
