import {defs, tiny} from './examples/common.js';
import {Particle} from './particle.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;
export const BBox = class BBox {
  // top: vec3(), left: vec3(), bottom: vec3(), right: vec3(), back: vec3(),
  // front: vec3() k: Float, coefficient to determine the magnitude of the
  // repulsive wall force
  constructor(
      top = vec3(0, 0.35, 0), left = vec3(-0.35, 0, 0),
      bottom = vec3(0, -9.35, 0), right = vec3(9.35, 0, 0),
      back = vec3(0, 0, -1), front = vec3(0, 0, 1.9), k = 5000) {
    // In order top, left, bottom, right, back, front
    this.faces = [top, left, bottom, right, back, front];
    this.norms = [
      vec3(0, -1, 0), vec3(1, 0, 0), vec3(0, 1, 0), vec3(-1, 0, 0),
      vec3(0, 0, 1), vec3(0, 0, -1)
    ];
    this.k = k;
  }
  update_particle(part) {
    const len = this.norms.length;
    for (let i = 0; i < len; i++) {
      const pos = part.pos;
      const vel = part.vel;

      const origin = this.faces[i];
      const norm = this.norms[i];
      const rel_pos = origin.minus(pos);
      const ks_ground_force = norm.times(this.k * (rel_pos.dot(norm)));
      const kd_ground_force = norm.times(vel.dot(norm));
      const ground_force = ks_ground_force.minus(kd_ground_force);

      if (ground_force.dot(norm) > 0) {
        part.ext_force = part.ext_force.plus(ground_force);
      }
    }
    return part.ext_force;
  }
  update(particles){
      for (let i = 0; i < particles.length; i++){
          const part = particles[i];
          particles[i].ext_force = this.update_particle(part);
      }
  }
}