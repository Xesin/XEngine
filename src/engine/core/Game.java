/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/
package engine.core;

import engine.pojo.Constants;
import engine.managers.cache.Cache;
import engine.maths.Vector2;
import engine.managers.state.EngineState;
import engine.managers.state.StateManager;
import engine.actors.Camera;
import engine.actors.Actor;
import engine.managers.loader.Loader;
import java.awt.Canvas;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.image.BufferStrategy;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JFrame;
import javax.swing.JPanel;

/**
 *
 * @author XiscoFerrer
 */
public class Game implements Runnable{
    
    private JFrame frame;
    private Canvas canvas;
    private BufferStrategy bufferStrategy;
    private Graphics customGraphics;
    private Camera camera;
    private Cache cache;
    private StateManager stateManager;
    private ActorFactory actorFactory;
    private Loader loader;
    private List<Actor> actors;
    
    private float desiredSleep = (1 / Constants.FRAME_RATE) * 1000;
    public long deltaTime;
    public float deltaSeconds;
    public long previousTime = 0;
    public Vector2 worldBounds = new Vector2(Constants.GAME_WIDTH, Constants.GAME_HEIGHT);
    private IStartPoint startPoint;
    
    public Game(IStartPoint startPoint){
        this.startPoint = startPoint;
        
    }
    
    @Override
    public void run() {
        frame = new JFrame("MY GAME");
        JPanel panel = (JPanel) frame.getContentPane();
        panel.setPreferredSize(new Dimension(Constants.GAME_WIDTH, Constants.GAME_HEIGHT));
        panel.setLayout(null);
        panel.setFocusable(false);
        
        
        canvas = new Canvas();
        canvas.setBounds(0, 0, Constants.GAME_WIDTH, Constants.GAME_HEIGHT);
        canvas.setIgnoreRepaint(true);
        panel.add(canvas);
        
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.pack();
        frame.setResizable(false);
        frame.setVisible(true);
        
        canvas.createBufferStrategy(2);
        canvas.requestFocus();
        customGraphics = new Graphics();
        
        
        bufferStrategy = canvas.getBufferStrategy();
        
        actors = new ArrayList<>();
        camera = new Camera(this);
        cache = new Cache();
        stateManager = new StateManager(this);   
        loader = new Loader(this);
        actorFactory = new ActorFactory(this);
        startPoint.start(this);
        while(!Thread.interrupted()){
            try {
                
                EngineState currentState = stateManager.getCurrentState();
                if(currentState != null && !loader.isLoading()){
                    update();
                    render();
                }
                
                if(deltaTime < desiredSleep){
                    Thread.sleep((long) (desiredSleep - deltaTime));
                }
            } catch (InterruptedException ex) {
                Logger.getLogger(Game.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }
    
    private void update(){
        EngineState currentState = stateManager.getCurrentState();
        long currentTime = System.currentTimeMillis();
        if(previousTime == 0){
            deltaTime = (long) desiredSleep;
        }else{
            deltaTime = currentTime - previousTime;
        }
        deltaSeconds = (deltaTime / (float) 1000);
        previousTime = currentTime;
        for(int i = actors.size() - 1; i >= 0; i--){
            Actor actor = actors.get(i);
            if(actor.isPendingDestroy){
                actor.destroy();
                actors.remove(actor);
            }else{
                if(actor.isAlive){
                    actor.update(deltaSeconds);
                }
            }
        }
        currentState.update(deltaSeconds);
        
        
        
    }
    
    private void render(){
        
        customGraphics.setGraphics((Graphics2D) bufferStrategy.getDrawGraphics());
        customGraphics.clearRect(0, 0, Constants.GAME_WIDTH, Constants.GAME_HEIGHT);
        for(int i = actors.size() - 1; i >= 0; i--){
            Actor actor = actors.get(i);
            if(actor.isPendingDestroy){
                actor.destroy();
                actors.remove(actor);
            }else{
                if(!actor.isPendingDestroy && actor.isAlive && actor.render){
                    actor.render(customGraphics, frame);
                }
            }
        }
        customGraphics.dispose();
        bufferStrategy.show();
    }
    
    public void addExistingActor(Actor actor){
        actors.add(actor);
    }
    
    public void destroy(){
        
    }
    
    public Camera getCamera() {
        return camera;
    }
    
    public Cache getCache() {
        return cache;
    }

    public StateManager getStateManager() {
        return stateManager;
    }

    public Loader getLoader() {
        return loader;
    }

    public ActorFactory getActorFactory() {
        return actorFactory;
    }
    
    
    
}
