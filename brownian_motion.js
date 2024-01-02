import {defs, tiny} from './examples/common.js';
import {Particle} from './particle.js';
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;
export const BrownianMotion = class BrownianMotion {
  constructor(random = false) {
    this.n = 1;
    // If this value is false switch to using normal distribution.
    this.random = random;
    this.step_size = .01;
  }

  // We generate a random value with some probability distribution.
  get_rand(p = .5) {
    return (Math.random() > p)*2 - 1;
  }

  // Normal function in reference to "https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve".
  randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();  // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5;                    // Translate to 0 -> 1
    // Rescale to be random walk from [-1, 1].
    num = num*2 - 1;
    if (num > 1 || num < -1) return this.randn_bm()  // resample between 0 and 1
      return num
  }

  random_walk() {
    // We use a random walk with equal probability of both distributions.
    return vec3(this.get_rand(), this.get_rand(), this.get_rand());
  }

  normal() {
    return vec3(this.randn_bm(), this.randn_bm(), this.randn_bm());
  }

  // We will try implementing with and without collisions, as well as trying with max boundary values.
  update(particles){
    for (let i = 0; i<particles.length; i++){
        let val;
        if (this.random){
            val = this.random_walk();
        }
        else{
            val = this.normal();
        }
        particles[i].pos.add_by(val.times(Math.sqrt(1/this.n)* this.step_size));
        // Then need to know the starting value
        this.n;
    }
  }
}