/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.managers.state;

import engine.core.Game;

/**
 *
 * @author XiscoFerrer
 */
public abstract class EngineState {
    
    protected Game gameRef;
    
    
    protected EngineState(Game game){
        gameRef = game;
    }
    public void preload(){
        
    }
    
    public void start(){
        
    }
    
    public void update(float deltaTime){
        
    }
    
    public void destroy(){
        
    }
}
