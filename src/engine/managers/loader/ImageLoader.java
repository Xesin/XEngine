/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.managers.loader;

import engine.managers.cache.Cache;
import engine.managers.cache.Image;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.imageio.ImageIO;

/**
 *
 * @author XiscoFerrer
 */
public class ImageLoader implements IObjectLoader{

    private String imageName;
    private String imageUri;
    private Cache cacheRef;
    
    public ImageLoader(String imageName, String imageUri, Cache cache){
        this.imageName = imageName;
        this.imageUri = imageUri;
        this.cacheRef = cache;
    }
    
    @Override
    public void Load() {
        URL resource = getClass().getClassLoader().getResource(imageUri);
        BufferedImage image;
        try {
            image = ImageIO.read(resource);
            cacheRef.putImage(imageName, new Image(image, Image.Type.SPRITE));
        } catch (IOException ex) {
            Logger.getLogger(ImageLoader.class.getName()).log(Level.SEVERE, null, ex);
        }
        
    }

    public String getImageName() {
        return imageName;
    }
    
}
