/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.core;


import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author XiscoFerrer
 */
public class Signal {
    
    private final List<SignalBinding> bindings;
    
    public Signal(){
        bindings = new ArrayList<>();
    }
    
    public void fireEvent(Object... args){
        bindings.forEach((binding) -> {
            binding.callBinding(args);
            if(binding.isOnce){
                bindings.remove(binding);
            }
        });
    }
    
    public void addBinding(SignalBinding func){
        bindings.add(func);
    }
    
    public void removeBinding(SignalBinding func){
        bindings.remove(func);
    }
}
