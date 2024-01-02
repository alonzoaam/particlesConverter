// Code for creating a wave motion among the selected particles
// In order to do this we give each particle a force towards a central point and
// a velocity tangent to this.
import {defs, tiny} from './examples/common.js';
import {Particle} from './particle.js';
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;

export const Curl = class Curl {
  // center: vec3 the point to perform the curl around
  // Outward vec, the normal vec to use in our cross product calculation.
  // r: radius of the circle to travel around
  // vel_mag: how large to make the velocity of curling particles
  constructor(
      center, vel_mag = 10, r = 10, out = vec3(0, 0, -1), enabled = true) {
    this.center = center;
    this.out = out;
    this.vel_mag = vel_mag;
    this.r = r;
    this.enabled = enabled;
    this.init = false;
  }

  init_vel(particles) {
    for (let i = 0; i < particles.length; i++) {
      const curr_part = particles[i];
      let force_dir = this.center.minus(curr_part.pos).normalized();
      let force_mag = curr_part.mass * Math.pow(this.vel_mag, 2) / this.r;
      let force = force_dir.times(force_mag);
      let vel_dir = this.out.cross(force_dir.times(-1).normalized());
      let vel = vel_dir.times(this.vel_mag);
      particles[i].vel = vel;
    }
  }
  update(particles) {
    if (!this.enabled) return;
    for (let i = 0; i < particles.length; i++) {
      // We now want to compute the change in the particles force that should
      // occur Recall from physics that centripetal force is mv^2/r
      let curr_part = particles[i];
      let force_dir = this.center.minus(curr_part.pos).normalized();
      let force_mag = curr_part.mass * Math.pow(this.vel_mag, 2) / this.r;
      let force = force_dir.times(force_mag);
      // let vel_dir = this.out.cross(force_dir.times(-1).normalized());
      // let vel = vel_dir.times(this.vel_mag);
      //particles[i].vel = vel;
      particles[i].ext_force.add_by(force);
    }
  }
}