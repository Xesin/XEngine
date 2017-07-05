/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.core;

import java.awt.Composite;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.Rectangle;
import java.awt.Shape;
import java.awt.geom.AffineTransform;
import java.awt.image.ImageObserver;

/**
 *
 * @author XiscoFerrer
 */
public class Graphics {
    
    private Graphics2D graphics = null;
    private AffineTransform oldTransform;
    private Rectangle oldClip;
    
    public void setGraphics(Graphics2D graphics){
        this.graphics = graphics;
    }
    
    
    
    public void scale(float x, float y){
        graphics.scale(x, y);
    }
    
    public void rotate(double angle){
        graphics.rotate(angle);
    }
    
    public void clearRect(int x, int y, int width, int height){
        graphics.clearRect(x, y, width, height);
    }
    
    public void clip(Shape shape){
        graphics.clip(shape);
    }
    
    public void clipRect(int x, int y, int width, int height){
        graphics.clipRect(x, y, width, height);
    }
    
    public void saveGraphics(){
        oldClip = graphics.getClipBounds();
        oldTransform = graphics.getTransform();
    }
    
    public void restoreGraphics(){
        graphics.setClip(oldClip);
        graphics.setTransform(oldTransform);
    }
    
    public void drawImage(Image image, int posX, int posY, ImageObserver observer){
        graphics.drawImage(image, posX, posY, observer);
        
    }
    
    public void drawImage(Image image, int posX, int posY, int width, int height, ImageObserver observer){
        graphics.drawImage(image, posX, posY, width, height, observer);
    }
    
    public void setComposite(Composite alpha){
        graphics.setComposite(alpha);
    }
    
    public void dispose(){
        graphics.dispose();
    }
    
    public void translate(int x, int y){
        graphics.translate(x, y);
    }
    
    public void translate(double x, double y){
        graphics.translate(x, y);
    }
}
