import {defs, tiny} from './examples/common.js';
import {Particle} from './particle.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;

export const HOME = class HOME {
    constructor(){}

    update_particle(part, dt) {
        let E = part.pos;
        let O = part.initPos;
        let P = O.plus(E.times(-1));
        let H = P.times(1/2);
        let cur_f_norm = part.ext_force.norm();
        let projHP_length = H.dot(P)*(1/H.norm());
        let H_unit = H.times(1/H.norm());
        let projHP = H_unit.times(projHP_length);
        /*if(cur_f_norm > H.norm()){
            let diff = projHP.plus(H.times(-1));
            part.ext_force = part.ext_force.plus(diff.times(-1));
            return part.ext_force;
        }
        if(P.norm() < 1){
            return part.ext_force;
        }*/
        /*else if(part.ext_force.norm() > 1){
            part.ext_force = part.ext_force.times(1/P.norm());
            return part.ext_force;
        }*/
        //part.ext_force = part.ext_force.plus(P.times(1/(5*P.norm())));
        part.ext_force = (((O.plus(E.times(-1))).times(1/dt)).plus(part.vel.times(-1))).times(part.mass/(1000*dt));
        /*if(P.norm() < 1){
            part.ext_force = P.times(1/P.norm());
            return part.ext_force;
        }
        part.ext_force = P.times(1/(P.norm()*P.norm()));
          if(this.returnHome === true){
        this.HOME.update(this.canvas_particles, this.time_step);
      }

        */
        return part.ext_force;
    }
    update(particles, time_step){
        for(let i = 0; i < particles.length; i++) {
            const part = particles[i];
            particles[i].ext_force = this.update_particle(part, time_step);
        }
    }
};