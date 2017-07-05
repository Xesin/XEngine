/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/
package engine.actors;

import engine.pojo.Axis;
import engine.pojo.Constants;
import engine.core.Game;
import engine.actors.Actor;
import engine.core.Graphics;
import java.awt.Frame;
import java.awt.Graphics2D;

/**
 *
 * @author XiscoFerrer
 */
public class Camera extends Actor{
    
    public Axis axisConstrain = Axis.BOTH;
    private Actor followedObject = null;
    
    private float offsetLeft = 0;
    private float offsetUp = 0;
    private boolean follow = false;

    public Camera(Game gameRef) {
        super(gameRef);
    }
    
    @Override
    public void render(Graphics buffer, Frame frameToRender) {
    }
    
    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        if(follow && followedObject != null){
            if(axisConstrain == Axis.BOTH || axisConstrain == Axis.HORIZONTAL){
                if ((followedObject.position.x - offsetLeft) - Constants.GAME_WIDTH / 2 > 0 && (followedObject.position.x + offsetLeft) + Constants.GAME_WIDTH / 2 < gameRef.worldBounds.x) {
                    position.x = followedObject.position.x - Constants.GAME_WIDTH / 2 - offsetLeft;
                }
            }
            if(axisConstrain == Axis.BOTH || axisConstrain == Axis.VERTICAL){
                if ((followedObject.position.y - offsetUp) - Constants.GAME_HEIGHT / 2 > 0 && (followedObject.position.y + offsetUp) + Constants.GAME_HEIGHT / 2 < gameRef.worldBounds.y) {
                    position.y = followedObject.position.y - Constants.GAME_HEIGHT / 2 - offsetUp;
                }
            }
            
        }
    }
    
    public void setFollowObject(Actor objectToFollow, float offsetLeft, float offsetUp){
        followedObject = objectToFollow;
        follow = true;
        this.offsetLeft = offsetLeft;
        this.offsetUp = offsetUp;
    }
    
    public void setFollowObject(Actor objectToFollow){
        followedObject = objectToFollow;
        follow = true;
        this.offsetLeft = 0;
        this.offsetUp = 0;
    }
    
}
