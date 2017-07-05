/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/
package engine.actors;

import engine.core.Game;
import engine.managers.cache.Image;
import engine.actors.Actor;
import engine.core.Graphics;
import java.awt.AlphaComposite;
import java.awt.Frame;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;

/**
 *
 * @author XiscoFerrer
 */
public class Sprite extends Actor{
    public String sprite = "";
    
    //anim attributes
    public int frame = 0;
    public int columns = 0;
    public int rows = 0;
    
    //Atlas
    public String json = "";
    
    public int width = 0;
    public int height = 0;
    
    
    public Sprite(Game gameRef, String sprite, float posX, float posY) {
        super(gameRef);
        position.setTo(posX, posY);
        this.sprite = sprite;
        Image imageToUse = gameRef.getCache().getImage(sprite);
        switch(imageToUse.type){
            case ATLAS:
                
                break;
            case SPRITE:
                width = imageToUse.frameWidth;
                height = imageToUse.frameHeight;
                columns = (int) Math.floor(imageToUse.image.getWidth() / width);
                rows = (int) Math.floor(imageToUse.image.getHeight()/ height);
                break;
        }
    }
    
    @Override
    public void render(Graphics graphics, Frame frameToRender) {
        Image imageToRender = gameRef.getCache().getImage(sprite);
        graphics.saveGraphics();
        applyTransform(graphics);
        graphics.setComposite(AlphaComposite.SrcOver.derive(alpha));
        
        if(imageToRender.type == Image.Type.SPRITE){
            int width = Math.round(this.width);
            int height = Math.round(this.height);
            int posX = Math.round(-(width * anchor.x));
            int posY = Math.round(-(height * anchor.y));
            int column = frame;
            
            if (column > columns - 1) {
                column = frame % columns;
            }
            
            graphics.clipRect(posX, posY, width, height);
            int row = (int) Math.floor(frame / columns);
            
            graphics.drawImage(imageToRender.image, posX + column * imageToRender.frameWidth, posY + row * imageToRender.frameHeight, width, height, frameToRender);
            //graphics.drawImage(imageToRender.image, posX, posY,posX + width, posY + height, column * imageToRender.frameWidth, row * imageToRender.frameHeight, imageToRender.frameWidth, imageToRender.frameHeight, frameToRender);
            //buffer.drawImage(imageToRender.image, 50, 50, frameToRender);
        }
        graphics.restoreGraphics();
        graphics.setComposite(AlphaComposite.SrcOver);
    }
    
}
