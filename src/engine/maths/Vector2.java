/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package engine.maths;

/**
 *
 * @author XiscoFerrer
 */
public class Vector2 {
    public float x;
    public float y;
    
    public Vector2(float x, float y){
        this.x = x;
        this.y = y;
    }
    
    public static Vector2 Zero(){
        return new Vector2(0 ,0);
    }
    
    
        /**
     * Devuelve un vector que es la resta de dos vectores
     * @param {XEngine.Vector} vector1
     * @param {XEngine.Vector} vector2
     * @returns {XEngine.Vector}
     */
    public static Vector2 sub (Vector2 vector1, Vector2 vector2) {
            Vector2 newVector = new Vector2(vector1.x, vector1.y);
            newVector.x -= vector2.x;
            newVector.y -= vector2.y;
            return newVector;
    };

    /**
     * Devuelve un vector que es la suma de dos vectores
     * @param {XEngine.Vector} vector1
     * @param {XEngine.Vector} vector2
     * @returns {XEngine.Vector}
     */
    public static Vector2 add (Vector2 vector1, Vector2 vector2) {
            Vector2 newVector = new Vector2(vector1.x, vector1.y);
            newVector.x += vector2.x;
            newVector.y += vector2.y;
            return newVector;
    };

    /**
     * Devuelve la distancia entre dos vectores
     * @param vector1
     * @param vector2
     * @returns Float
     */
    public static float distance (Vector2 vector1, Vector2 vector2) {
        Vector2 difference = Vector2.sub(vector1, vector2);
        return difference.length();
    };
    
    /**
     * Asigna valores al vector
     * @method XEngine.Vector#setTo
     * 
     * @param x - Valor en la coordenada X
     * @param y - Valor en la coordenada Y
     * @public
     */
    public void setTo (float x, float y) { //Asigna los valores (solo por comodidad)
            this.x = x;
            this.y = y;
    }
    
        /**
     * Asigna valores al vector
     * @method XEngine.Vector#setTo
     * 
     * @param xy - Valor en la coordenada X e Y
     * @public
     */
    public void setTo (float xy) { //Asigna los valores (solo por comodidad)
            this.x = xy;
            this.y = xy;
    }

    /**
     * Suma a este vector los valores de otro
     * @method XEngine.Vector#add
     * 
     * @param other - Vector a sumar
     * @public
     */
    public void add (Vector2 other) { //Suma de vectores
            this.x += other.x;
            this.y += other.y;
    }

    /**
     * Resta a este vector los valores de otro
     * @method XEngine.Vector#sub
     * 
     * @param other - Vector a restar
     * @public
     */
    public void sub (Vector2 other) { //Resta de vectores
            this.x -= other.x;
            this.y -= other.y;
    }

    /**
     * Multiplica a este vector los valores de otro
     * @method XEngine.Vector#multiply
     * 
     * @param other - Vector a multiplicar
     * @public
     */
    public void multiply (Vector2 other) { //Multiplicación de vectores
            this.x *= other.x;
            this.y *= other.y;
    }

    /**
     * Rota el vector tantos angulos como se le indique (angulos en radianes)
     * @method rotate
     * @param angle - Angulos a rotar
     * @public
     */
    public void rotate (float angle) { //Rotar el vector
            float x = this.x;
            float y = this.y;
            this.x = (float) (x * Math.cos(angle) - y * Math.sin(angle));
            this.y = (float) (x * Math.sin(angle) + y * Math.cos(angle));
    }

    /**
     * Normaliza el Vector (Ajusta las coordenadas para que la longitud del vector sea 1)
     * @method normalize
     * @public
     */
    public void normalize () { //Normalizar el vector
            float d = this.length();
            if (d > 0) {
                    this.x = this.x / d;
                    this.y = this.y / d;
            }
    }

    /**
     * Proyecta este vector en otro
     * @method XEngine.Vector#project
     * 
     * @param other - Vector en el que proyectar
     * @public
     */
    public void project (Vector2 other) { //Projectar el vector en otro
            float amt = this.dot(other) / other.len2();
            this.x = amt * other.x;
            this.y = amt * other.y;
    }

    /**
     * Retorna el producto escalar del vector con otro vector
     * @method XEngine.Vector#dot
     * 
     * @param other - Vector con el que hacer la operación
     * @return {Number}
     * @public
     */
    float dot (Vector2 other) { //Producto escalar
            return this.x * other.x + this.y * other.y;
    }

    /**
     * Escala el vector
     * @method XEngine.Vector#scale
     * 
     * @param x - Valor en la coordenada X
     * @param y - Valor en la coordenada Y
     * @public
     */
    public void scale(float x, float y) { //Escala del vector
            this.x *= x;
            this.y *= y;
    }

    /**
     * Refleja el vector dado un eje
     * @method XEngine.Vector#reflect
     * 
     * @param {XEngine.Vector} axis - Eje en el que refleja el vector
     * @returns {XEngine.Vector}
     * @public
     */
    public void reflect(Vector2 axis) { //Reflejar el vector en un eje (Vector)
        float x = this.x;
        float y = this.y;
        this.project(axis);
        this.scale(2,2);
        this.x -= x;
        this.y -= y;
    }

    
    /**
    * Longitud del vector
    * @method XEngine.Vector#length
    * 
    * @return Float
    * @public
    */
   public float length () { //Longitud de un vector
        return (float) Math.sqrt(this.len2());
   }

   /**
    * Devuelve el cuadrado de la longitud
    * @method XEngine.Vector#len2
    * 
    * @return Float
    * @public
    */
   public float len2 () { //Cuadrado de la longitud de un vector
           return this.dot(this);
   }
    
}
