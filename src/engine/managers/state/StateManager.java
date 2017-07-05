/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.managers.state;

import engine.core.Game;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author XiscoFerrer
 * @param <T>
 */
public class StateManager<T> {
    
    private final Game gameRef;
    private Class previousState;
    private EngineState currentState;
    
    public StateManager(Game game){
        gameRef = game;
    }   
    
    public void startState(Class<T> stateToStart){
        
        if(!EngineState.class.isAssignableFrom(stateToStart)){
            throw new IllegalArgumentException("Class not inherit from EngineState");
        }
        if(currentState != null){
            previousState = (Class) currentState.getClass();
            currentState.destroy();
            gameRef.destroy();
        }
        System.gc();
        try {
            Constructor constructor = stateToStart.getDeclaredConstructor(Game.class);
            constructor.setAccessible(true);
            currentState = (EngineState) constructor.newInstance(gameRef);
            currentState.preload();
            gameRef.getLoader().startLoad();
        } catch (NoSuchMethodException | SecurityException | InstantiationException | IllegalAccessException | IllegalArgumentException | InvocationTargetException ex) {
            Logger.getLogger(StateManager.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public void restart(){
        startState((Class) currentState.getClass());
    }
    
    public EngineState getCurrentState() {
        return currentState;
    }

    public Class getPreviousState() {
        return previousState;
    }
}
