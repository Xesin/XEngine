/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package xenginej;

import engine.core.Game;
import engine.core.IStartPoint;

/**
 *
 * @author XiscoFerrer
 */
public class XEngineJ implements IStartPoint{

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        
        Game game = new Game(new XEngineJ());
        
        Thread gameThread = new Thread(game);
        
        gameThread.start();
        
    }

    @Override
    public void start(Game gameRef) {
        gameRef.getStateManager().startState(LoadState.class);
    }
    
}
