import {defs, tiny} from './examples/common.js';
import {get_readers, save_to_canvas} from './image_loader.js'
import {Particle} from './particle.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;

export const ColorInterpolation =
    class ColorInterpolation {
        constructor() {}
        update_colors(speed, canvas_newcolors, canvas_particles, caller, uniforms, shapes, materials) {  //speed is a fraction between 0 and 1, smaller numbers will make the colors change slower
            for (let i = 0; i < Math.min(canvas_newcolors.length, canvas_particles.length); i++) {
                let curr_r = (canvas_particles[i].color[0]);
                let curr_g = (canvas_particles[i].color[1]);
                let curr_b = (canvas_particles[i].color[2]);
                let new_r = 0;
                let new_g = 0;
                let new_b = 0;
                new_r = (((Number(canvas_newcolors[i][0]) - Number(curr_r)) * speed) + Number(curr_r));
                new_g = (Number(canvas_newcolors[i][1]) - Number(curr_g)) * speed + Number(curr_g);
                new_b = (Number(canvas_newcolors[i][2]) - Number(curr_b)) * speed + Number(curr_b);
                canvas_particles[i].set_color(color(new_r, new_g, new_b, 0.5));
                canvas_particles[i].draw(caller, uniforms, shapes, materials);
            }
        }
    }