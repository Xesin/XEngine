/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.managers.loader;

import engine.core.Game;
import engine.core.Signal;
import engine.managers.cache.Cache;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author XiscoFerrer
 */
public class Loader implements Runnable{

    private Cache cacheRef;
    private Game gameRef;
    private Signal onFileComplete;
    private List<IObjectLoader> pendingsLoads;
    private boolean isLoading = false;
    private float progress = 0;
    
    public Loader(Game gameRef){
        this.gameRef = gameRef;
        cacheRef = gameRef.getCache();
        pendingsLoads = new ArrayList<>();
        onFileComplete = new Signal();
        progress = 0;
        isLoading = false;
    }
    
    @Override
    public void run() {
        
        if(pendingsLoads.size() > 0){
            for(int i = 0; i < pendingsLoads.size(); i++){
                IObjectLoader objectToLoad = pendingsLoads.get(i);
                objectToLoad.Load();
                progress = (float) (i + 1) / (float) pendingsLoads.size();
                onFileComplete.fireEvent(progress);
            }
        }
        gameRef.getStateManager().getCurrentState().start();
        flush();
    }
    
    public void addImage(String imageName, String imageUri){
        pendingsLoads.add(new ImageLoader(imageName, imageUri, cacheRef));
    }

    public Signal getOnFileComplete() {
        return onFileComplete;
    }

    public boolean isLoading() {
        return isLoading;
    }

    public float getProgress() {
        return progress;
    }
    
    public void startLoad(){
        isLoading = true;
        Thread loadThread = new Thread(this);
        loadThread.start();
    }
    
    public void flush(){
        pendingsLoads = new ArrayList<>();
        onFileComplete = new Signal();
        progress = 0;
        isLoading = false;
        System.gc();
    }
}
