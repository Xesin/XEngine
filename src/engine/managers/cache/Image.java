/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.managers.cache;

import java.awt.image.BufferedImage;

/**
 *
 * @author XiscoFerrer
 */
public class Image {
    public enum Type{
        SPRITE,
        ATLAS
    }
    
    public BufferedImage image;
    public Type type;
    public int frameWidth = 1;
    public int frameHeight = 1;
    
    
    public Image(BufferedImage image, Type type){
        this.image = image;
        this.type = type;
        frameWidth = image.getWidth();
        frameHeight = image.getHeight();
    }
    
    public Image(BufferedImage image, Type type, int frameWidth, int frameHeight){
        this.image = image;
        this.type = type;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }
}
