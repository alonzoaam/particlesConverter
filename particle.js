import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const Particle =
    class Particle {
        constructor(mass=1, pos = vec3(0,0,0), vel = vec3(0,0,0), acc = vec3(0,0,0),
                    f = vec3(0,0,0),
                    new_color = color(0,0,1,0)) {
            this.mass = mass;
            this.pos = pos
            this.vel = vel;
            this.acc = acc;
            this.ext_force = f;
            this.color = new_color;
            this.valid = true;
            this.init = false;
            this.initPos = vec3(null,null,null);
            //this.g_acc = vec3(0,9.8,0);
        }
        reset_force(){
            this.ext_force = vec3(0,0,0);
        }
        update(dt) {
            if (!this.valid) {
                throw "Initialization not complete."

            }
            this.acc = this.ext_force.times(1 / this.mass);
            this.vel = this.vel.plus(this.acc.times(dt));
            this.pos = this.pos.plus(this.vel.times(dt));
        }

        set_pos(x,y,z){
            this.pos = vec3(x,y,z);
        }

        set_vel(vx,vy,vz){
            this.vel = vec3(vx, vy, vz);
        }

        set_acc(ax, ay, az){
            this.acc = vec3(ax, ay, az);
        }

        set_color(color){
            this.color = color;
        }

        draw(webgl_manager, uniforms, shapes, materials) {
            const blue =  color(0, 0, 1, 1), red = color(1, 0, 0,1);
            const pos = this.pos;
            let model_transform = Mat4.scale(0.2, 0.2, 0.2);
            model_transform.pre_multiply(Mat4.translation(pos[0], pos[1], pos[2]));
            //console.log("color is " + this.color);
            shapes.ball.draw(webgl_manager, uniforms, model_transform, {...materials.plastic, color: this.color});
        }

    };