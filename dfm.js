import {defs, tiny} from './examples/common.js';
import { Scene_To_Texture_Demo } from './examples/scene-to-texture-demo.js';
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;

export const DFM = class DFM {
  // This class will handle the params necessary for the discrete fluid model.
  // particles: Particle[], the particles to update on each step.
  constructor(a = 2.3, b = 1.5, alpha = .6, beta = 2, eps = 10e-2) {
    this.a = a;
    this.b = b;
    this.alpha = alpha;
    this.beta = beta;
    this.eps = eps;
  }
  // Could also initialize with all the particles we want to manage,
  // likely makes some sort of optimization to make more efficient.
  // This is the trivial way to perform the update.
  // Compute the forces using the Leonard-Jones force profile.
  // Lecture 7 Slide 10
  // g_ij = m_i* m_j *( alpha/(d_ij + epsilon) -beta/(d_ij + epsilon)^b)*d_ij
  // part_1: Particle, part_2: Particle
  LJ(part_1, part_2) {
    const m_1 = part_1.mass;
    const m_2 = part_2.mass;
    const x_1 = part_1.pos;
    const x_2 = part_2.pos;
    const dir = x_1.minus(x_2);
    const d = dir.norm();
    const f = dir.times(
        m_1 * m_2 *
        (this.alpha / Math.pow(d + this.eps, this.a) -
         this.beta / (Math.pow(d + this.eps, this.b))) *
        d);
    return f.times(1 / 100);
  }
  // A different implementation based on potential as online sources seem to
  // disagree with the lecture slides.
  LJP(part_1, part_2) {
    const m_1 = part_1.mass;
    const m_2 = part_2.mass;
    const v_1 = part_1.vel;
    const v_2 = part_2.vel;
    const x_1 = part_1.pos;
    const x_2 = part_2.pos;
    const dir = x_1.minus(x_2);
    const d = dir.norm();
    const d_vec = dir.normalized();
    const sigma = .2;
    const MAX_FORCE = 10;
    const MAX_VEL = 5;
    // We use alpha as the value to scale by.
    let f =
        (-48 * this.alpha * Math.pow(sigma, 12) / Math.pow(d + this.eps, 13) +
         24 * this.alpha * Math.pow(sigma, 6) / Math.pow(d + this.eps, 7));
    f = Math.min(MAX_FORCE, f);
    // TODO(morleyd): Add damping force so doesn't diverge.
    f = d_vec.times(f);
    return f;
  }

  update(particles) {
    // const prior_parts = Array.from(particles);
    // Assume all other updated forces occur after this update.
    // Find a way to reduce number of particles sampling over
    const SAMPLES = 10;
    let rand_indices = [];
    const length = particles.length;
    // Could try a different distribution than uniform and also observe the
    // effect.

    while (rand_indices.length < SAMPLES && rand_indices.length != length &&
           length > 0) {
      const r = Math.floor(Math.random() * (length - 1));
      if (rand_indices.indexOf(r) === -1) rand_indices.push(r);
      // console.log("Here");
    }

    for (let i = 0; i < particles.length; i++) {
      let curr_part = particles[i];
      // curr_part.ext_force = vec3(0,0,0);
      //  Instead of using all the particles randomly sample over the particles.
      for (let j = 0; j < rand_indices.length; j++) {
        if (i >= rand_indices[j]) {
          continue;
        }
        // const index = rand_indices[j];
        let other_part = particles[rand_indices[j]];
        const force = this.LJP(curr_part, other_part);
        // console.log('The force is');
        //  console.log(force);
        curr_part.ext_force.add_by(force);
        force.scale_by(-1);
        other_part.ext_force.add_by(force);
      }
    }
  }
};