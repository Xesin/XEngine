/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.managers.cache;

import java.awt.image.BufferedImage;
import java.util.HashMap;

/**
 *
 * @author XiscoFerrer
 */
public class Cache {
    private final HashMap<String, Image> images = new HashMap<>();
    
    public Image getImage(String imageKey){
        if(images.containsKey(imageKey)){
            return images.get(imageKey);
        }else{
            throw new IllegalArgumentException("Image is not present in cache");
        }
    }
    
    public void putImage(String imageKey, Image image){
        if(images.containsKey(imageKey)){
            throw new IllegalArgumentException("Image allready in cache");
        }else{
            images.put(imageKey, image);
        }
    }
}
