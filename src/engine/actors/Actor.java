/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/
package engine.actors;

import engine.core.Game;
import engine.core.Graphics;
import engine.core.Signal;
import engine.maths.Vector2;
import java.awt.Frame;
import java.awt.Graphics2D;
/**
 *
 * @author XiscoFerrer
 */
public abstract class Actor {
    public Vector2 position = new Vector2(0,0);
    public Vector2 scale = new Vector2(1,1);
    public Vector2 anchor = new Vector2(0,0);
    
    protected Game gameRef;
    
    public boolean isPendingDestroy = false;
    public boolean isAlive = true;
    public boolean render = true;
    public boolean fixedToCamera = false;
    public boolean inputEnabled = false;
    public boolean isInputDown = false;
    
    public Signal onClick = new Signal();
    public Signal onInputDown  = new Signal();
    public Signal onInputUp = new Signal();
    public Signal onInputOver = new Signal();
    public Signal onInputLeft = new Signal();
    
    public float alpha = 1f;
    public float rotation = 0f;
    
    public Actor parent;
    
    public abstract void render(Graphics buffer, Frame frameToRender);
    
    public Actor(Game gameRef){
        this.gameRef = gameRef;
    }
    
    protected void onDestroy(){
        
    }
    
    public void update(float deltaTime){
        
    }
    
    public void destroy(){
        kill();
        isPendingDestroy = true;
        onDestroy();
    }
    
    public void kill(){
        isAlive = false;
    }
    
    public void restore(float posX, float posY){
        position.x = posX;
        position.x = posY;
        isAlive = true;
    }
    
    public Vector2 getWorldPos() { //Obtiene la posición del objeto en el mundo teniendo en cuenta la posición local y la posición del mundo del padre
        if(parent != null){
            Vector2 parentPos = parent.getWorldPos();
            float x = position.x + parentPos.x;
            float y = position.y + parentPos.y;
            return new Vector2(x, y);
        }else{
            return new Vector2(position.x, position.y);
        }
    }
    
    public float getTotalRotation(){
        if(parent != null){
            return parent.getTotalRotation() + rotation;
        }else{
            return rotation;
        }
    }
    
    protected void applyTransform(Graphics graphics){
        graphics.translate(position.x, position.y);
        graphics.rotate(getTotalRotation() * Math.PI / 180);
        graphics.scale(scale.x, scale.y);
    }
}
