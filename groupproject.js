import {BrownianMotion} from './brownian_motion.js';
import {BBox} from './collision.js';
import {ColorInterpolation} from './colorinterpolation.js';
import {Curl} from './curl.js';
import {DFM} from './dfm.js';
import {defs, tiny} from './examples/common.js';
import {get_readers, save_to_canvas} from './image_loader.js'
import {Particle} from './particle.js';
import {HOME} from './returnhome.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} =
    tiny;

export const project_base = defs.project_base =
    class Part_two_spring_base extends
    Component {  // **My_Demo_Base** is a Scene that can be added to any display
                 // canvas. This particular scene is broken up into two pieces
                 // for easier understanding. The piece here is the base class,
                 // which sets up the machinery to draw a simple scene
                 // demonstrating a few concepts.  A subclass of it,
                 // Part_one_hermite, exposes only the display() method, which
                 // actually places and draws the shapes, isolating that code so
                 // it can be experimented with on its own.
  init() {
    console.log('init');
    // At the beginning of our program, load one of each of these shape
    // definitions onto the GPU.  NOTE:  Only do this ONCE per shape it
    // would be redundant to tell it again.  You should just re-use the
    // one called "box" more than once in display() to draw multiple cubes.
    // Don't define more than one blueprint for the same thing here.
    this.shapes = {
      'box': new defs.Cube(),
      'ball': new defs.Subdivision_Sphere(4),
      'axis': new defs.Axis_Arrows()
    };

    // *** Materials: ***  A "material" used on individual shapes specifies all
    // fields that a Shader queries to light/color it properly.  Here we use a
    // Phong shader. We can now tweak the scalar coefficients from the Phong
    // lighting formulas. Expected values can be found listed in
    // Phong_Shader::update_GPU().
    const phong = new defs.Phong_Shader();
    const tex_phong = new defs.Textured_Phong();
    this.materials = {};
    this.materials.plastic = {
      shader: phong,
      ambient: .2,
      diffusivity: 1,
      specularity: .5,
      color: color(.9, .5, .9, 1)
    };
    this.materials.pure_color = {
      shader: phong,
      ambient: 1.0,
      diffusivity: 0,
      specularity: 0,
      color: color(.9, .5, .9, 1)
    };
    this.materials.metal = {
      shader: phong,
      ambient: .2,
      diffusivity: 1,
      specularity: 1,
      color: color(.9, .5, .9, 1)
    };
    this.materials.rgb = {
      shader: tex_phong,
      ambient: .5,
      texture: new Texture('assets/rgb.jpg')
    };
    this.time_step = 0.001;
    this.t_sim = 0.0;
    this.particles = [];

    /*this.particles.push(new Particle(
        1, vec3(0, 0, 0), vec3(-1, 0, -1), vec3(0, 0, 0), vec3(0, 0, 0),
        color(1, 0, 0, 1)));
*/
    this.canvas_particles = [];
    this.canvas_newcolors = [];
    this.loaded_canvas = false;

    this.loaded_canvas2 = false;
    this.colorinterpolator = new ColorInterpolation();
    this.returnHome = false;
    this.fullscreenTog = false;


    this.DFM = new DFM();
    this.BBox = new BBox();
    this.HOME = new HOME();
    this.Curl = new Curl(vec3(2, -3, 1));
    this.Brownian = new BrownianMotion();
    this.simulate = false;
    this.go_home = false;
    this.curl = false;
    this.fluid = false;
    this.color_interp = false;
    this.brownian = false;
    this.collision = true;
    this.has_refocused = false;
    this.start = undefined;

    this.start_fluid = 15;
    this.start_go_home = 20;
    this.start_curl = 30;
    this.hasRun = false;
    this.hasRun2 = false;
  }

  render_animation(caller) {  // display():  Called once per frame of animation.
                              // We'll isolate out
    // the code that actually draws things into Part_one_hermite, a
    // subclass of this Scene.  Here, the base class's display only does
    // some initial setup.

    // Setup -- This part sets up the scene's overall camera matrix, projection
    // matrix, and lights:
    if (!caller.controls) {
      this.animated_children.push(
          caller.controls =
              new defs.Movement_Controls({uniforms: this.uniforms}));
      caller.controls.add_mouse_controls(caller.canvas);

      // Define the global camera and projection matrices, which are stored in
      // shared_uniforms.  The camera matrix follows the usual format for
      // transforms, but with opposite values (cameras exist as inverted
      // matrices).  The projection matrix follows an unusual format and
      // determines how depth is treated when projecting 3D points onto a plane.
      // The Mat4 functions perspective() or orthographic() automatically
      // generate valid matrices for one.  The input arguments of perspective()
      // are field of view, aspect ratio, and distances to the near plane and
      // far plane.

      // !!! Camera changed here
    /*if(this.fullscreenTog === false && !this.has_refocused){
        Shader.assign_camera(
          Mat4.look_at(vec3(15, -1, 15), vec3(-6, -7, -6), vec3(0, 1, 0)),
          this.uniforms);
          this.has_refocused = true;
      }*/

    }
    this.uniforms.projection_transform =
        Mat4.perspective(Math.PI / 4, caller.width / caller.height, 1, 100);
    const t = this.t = this.uniforms.animation_time / 1000;
    const angle = Math.sin(t);
    // *** Lights: *** Values of vector or point lights.  They'll be consulted
    // by the shader when coloring shapes.  See Light's class definition for
    // inputs. const light_position = Mat4.rotation( angle,   1,0,0 ).times(
    // vec4( 0,-1,1,0 ) ); !!!
    // !!! Light changed here


    // const light_position = vec4(20 * Math.cos(angle), 20,  20 *
    // Math.sin(angle), 1.0);
    const light_position = vec4(20, 20, 20, 1.0);
    this.uniforms.lights = [defs.Phong_Shader.light_source(
        light_position, color(1, 1, 1, 1), 1000000)];
  }
}


export class Project extends project_base {
  render_animation(caller) {  // display():  Called once per frame of animation.
                              // For each shape that you want to
    // appear onscreen, place a .draw() call for it inside.  Each time, pass in
    // a different matrix value to control where the shape appears.

    // Variables that are in scope for you to use:
    // this.shapes.box:   A vertex array object defining a 2x2x2 cube.
    // this.shapes.ball:  A vertex array object defining a 2x2x2 spherical
    // surface. this.materials.metal:    Selects a shader and draws with a shiny
    // surface. this.materials.plastic:  Selects a shader and draws a more matte
    // surface. this.lights:  A pre-made collection of Light objects.
    // this.hover:  A boolean variable that changes when the user presses a
    // button. shared_uniforms:  Information the shader needs for drawing.  Pass
    // to draw(). caller:  Wraps the WebGL rendering context shown onscreen.
    // Pass to draw().

    // Call the setup code that we left inside the base class:
    console.log('Simulate: ' + this.simulate);
    console.log('Go home: ' + this.go_home);
    console.log('Curl: ' + this.curl);
    console.log('Fluid: ' + this.fluid);
    console.log('Color interp ' + this.color_interp);
    super.render_animation(caller);
    const white = color(1, 1, 1, 1), blue = color(0, 0, 1, 1), black = color(0.01,0.01,0.01,1);
    const t = this.t = this.uniforms.animation_time / 1000;


    let floor_transform = Mat4.translation(0, -10.5, 0)
                              .times(Mat4.scale(10, 0.01, 10))
                              .times(Mat4.rotation(Math.PI / 4, 0, 1, 0));
    this.shapes.box.draw(
        caller, this.uniforms, floor_transform,
        {...this.materials.plastic, color: white});
    let lwall_transform = Mat4.translation(7, -0.5, -7)
                              .times(Mat4.scale(1, 1, 1))
                              .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
                              .times(Mat4.scale(.01, 10, 10));
    this.shapes.box.draw(
        caller, this.uniforms, lwall_transform,
        {...this.materials.plastic, color: white});
    let rwall_transform = Mat4.translation(-7, -0.5, 7)
                              .times(Mat4.scale(1, 1, 1))
                              .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
                              .times(Mat4.scale(.01, 10, 10));
    this.shapes.box.draw(
        caller, this.uniforms, rwall_transform,
        {...this.materials.plastic, color: white});
    let bwall_transform = Mat4.translation(-7, -0.5, -7)
                              .times(Mat4.scale(1, 1, 1))
                              .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
                              .times(Mat4.scale(10, 10, .01));
    this.shapes.box.draw(
        caller, this.uniforms, bwall_transform,
        {...this.materials.plastic, color: white});
    // let test_transform = Mat4.translation(2, -3,
    // 1).times(Mat4.scale(.1,.1,.1)); this.shapes.ball.draw(caller,
    // this.uniforms, test_transform, {...this.materials.plastic, color:white});
    // box for particles

    let pb_left_transform =
        Mat4.translation(-1, -4, 0).times(Mat4.scale(0.5, 5.5, 2));
    this.shapes.box.draw(
        caller, this.uniforms, pb_left_transform,
        {...this.materials.plastic, color: blue});
    let pb_bottom_transform =
        Mat4.translation(4.5, -10, 0).times(Mat4.scale(6, 0.5, 2));
    this.shapes.box.draw(
        caller, this.uniforms, pb_bottom_transform,
        {...this.materials.plastic, color: blue});
    let pb_right_transform =
        Mat4.translation(10, -4, 0).times(Mat4.scale(0.5, 5.5, 2));
    this.shapes.box.draw(
        caller, this.uniforms, pb_right_transform,
        {...this.materials.plastic, color: blue});
    let pb_top_transform =
        Mat4.translation(4.5, 1, 0).times(Mat4.scale(6, 0.5, 2));
    this.shapes.box.draw(
        caller, this.uniforms, pb_top_transform,
        {...this.materials.plastic, color: blue});
    let pb_back_transform =
        Mat4.translation(4.5, -4.5, -2).times(Mat4.scale(6, 6, 0.5));
    this.shapes.box.draw(
        caller, this.uniforms, pb_back_transform,
        {...this.materials.plastic, color: blue});
    // draw a particle for testing
    // this.particles[0].pos = vec3(1, 0, 1);
    // this.particles[0].vel = vec3(0, 50, 0);
    // this.particles[0].acc = vec3(1, 1, 1);
    // this.particles[0].valid = true;
    if(this.fullscreenTog === true) {
      Shader.assign_camera(
        Mat4.look_at(vec3(4.5,-4.5,13), vec3(4.5,-4.5,0), vec3(0,1,0)),
        this.uniforms);
    }
    else if (this.has_refocused == false){
      Shader.assign_camera(
        Mat4.look_at(vec3(15, -1, 15), vec3(-6, -7, -6), vec3(0, 2, 0)),
        this.uniforms);
        this.has_refocused = true;

    }

    let dt = this.dt =
        Math.min(1 / 30, this.uniforms.animation_delta_time / 1000);
    const t_next = this.t_sim + dt;
    const readers = get_readers();

    if (this.loaded_canvas == false && readers.length >= 1) {
      // Load the given canvas
      const reader = readers[0];
      const width = reader.width;
      const height = reader.height;
      const x_offset = 0;
      const x_scale = .3;
      const y_scale = .3;
      const y_offset = 0;
      const z_offset = 0;
      const opacity = .5;
      const SCALE = 255;

      this.canvas_particles = new Array(width * height);

      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          // We need to create a transformation matrix for each matrix.
          // console.log("i: "+i+" j: "+j);
          const rgb = reader.get_pixel(i, j);

          // Set the height to be negative so we build the value down.
          const x = x_offset + i * x_scale;
          const y = y_offset - j * y_scale;
          const z = z_offset;
          let curr_particle = new Particle();
          curr_particle.set_pos(x, y, z);
          if (curr_particle.init === false) {
            curr_particle.initPos = vec3(x, y, z);
            curr_particle.init === true;
          }
          curr_particle.set_color(
              color(rgb[0] / SCALE, rgb[1] / SCALE, rgb[2] / SCALE, opacity));

          this.canvas_particles[j * height + i] = curr_particle;
        }
      }
      this.loaded_canvas = true;
      // readers.close();
    }



    // Draw all the particles in the image
    for (let i = 0; i < Math.min(this.canvas_particles.length, 10000); i++) {
      const particle = this.canvas_particles[i];
      particle.draw(caller, this.uniforms, this.shapes, this.materials);
    }

    // read in pixels for second image
    if (this.loaded_canvas == true && this.loaded_canvas2 == false &&
        readers.length >= 2) {
      const reader2 = readers[1];

      const width = reader2.width;
      const height = reader2.height;
      const SCALE = 255;
      this.canvas_newcolors = new Array(width * height);

      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          const rgb = reader2.get_pixel(i, j);
          let curr = new Array();
          curr.push((rgb[0] / SCALE));
          curr.push((rgb[1] / SCALE));
          curr.push((rgb[2] / SCALE));
          this.canvas_newcolors[j * height + i] = curr;
        }
      }
      this.loaded_canvas2 = true;
    }

    // Update each particle using integration technique.
    while (this.t_sim < t_next) {
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].reset_force();
      }
      if (this.collision && !this.brownian) {
        this.BBox.update(this.particles);
      }

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update(this.time_step);
      }



      for (let i = 0; i < Math.min(this.canvas_particles.length, 10000); i++) {
        this.canvas_particles[i].reset_force();
      }
      if(this.collision && ! this.brownian){
      this.BBox.update(this.canvas_particles);
      }
      // Set color interp, Start with curl, then set all velocities to 0, then
      // fluid, then return home
      this.hasRun = false;
      if (this.simulate) {
        if (this.start_time == undefined) {
          this.start_time = this.t;
        }
        this.color_interp = true;
        const rel_time = this.t - this.start_time;
        if (rel_time < this.start_fluid) {
          this.fluid = true;
        } else if (
            rel_time >= this.start_fluid && rel_time < this.start_go_home) {
          this.reset_vals();
          // Also set all particles to velocity 0
          if (!this.hasRun) {
            for (let q = 0; q < this.canvas_particles.length; q++) {
              this.canvas_particles[q].vel = vec3(0, 0, 0);
              this.hasRun = true;
            }
          }
          this.returnHome = true;
        } else if (rel_time >= this.start_go_home && rel_time < this.start_curl) {
          // this.reset_vals();
          this.returnHome = false;
          if (!this.hasRun2) {
            for (let q = 0; q < this.canvas_particles.length; q++) {
              this.canvas_particles[q].vel = vec3(0, 0, 0);
              this.hasRun2 = true;
            }
          }
          this.curl = true;
        } else if (rel_time >= this.start_curl) {
          this.curl = false;
          if (!this.hasRun) {
            for (let q = 0; q < this.canvas_particles.length; q++) {
              this.canvas_particles[q].vel = vec3(0, 0, 0);
              this.hasRun = true;
            }
          }
          this.returnHome = true;
        }
      }

      /*
else if (rel_time >= this.start_curl && rel_time < this.start_go_home_two) {
          this.curl = false;
          if (!this.hasRun) {
            for (let q = 0; q < this.canvas_particles.length; q++) {
              this.canvas_particles[q].vel = vec3(0, 0, 0);
              this.hasRun = true;
            }
          }
          this.returnHome = true;
        } else if (rel_time >= this.start_go_home_two && rel_time < this.start_brownian) {
          this.returnHome = false;
          this.brownian = true;
        } else if (rel_time >= this.start_brownian) {
          this.brownian = false;
          if (!this.hasRun) {
            for (let q = 0; q < this.canvas_particles.length; q++) {
              this.canvas_particles[q].vel = vec3(0, 0, 0);
              this.hasRun = true;
            }
          }
          this.returnHome = true;
        }
      */

      if (this.fluid) {
        this.DFM.update(this.canvas_particles);
      }

      if (this.returnHome) {
        if (!this.hasRun) {
          for (let q = 0; q < this.canvas_particles.length; q++) {
            this.canvas_particles[q].vel = vec3(0, 0, 0);
            this.hasRun = true;
          }
        }
        this.HOME.update(this.canvas_particles, this.time_step);
      }
      // this.DFM.update(this.canvas_particles);

      // Pick between the different methods.

      if (this.curl) {
        /* if(!this.Curl.init){
           this.Curl.init_vel(this.canvas_particles);
           this.Curl.init = true;
         }*/
        this.Curl.update(this.canvas_particles);
      }

      if (this.brownian) {
        this.Brownian.update(this.canvas_particles);
      }

      for (let i = 0; i < Math.min(this.canvas_particles.length, 10000); i++) {
        this.canvas_particles[i].update(this.time_step);
      }
      this.t_sim += this.time_step;
    }

    // Draw all the particles in the image
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      particle.draw(caller, this.uniforms, this.shapes, this.materials);
    }


    // update particle colors
    if (this.loaded_canvas2 && this.color_interp) {
      this.colorinterpolator.update_colors(
          0.001, this.canvas_newcolors, this.canvas_particles, caller,
          this.uniforms, this.shapes, this.materials);
      // speed is a fraction between 0 and 1, smaller numbers will make the
      // colors change slower
    }


    this.t_sim += this.time_step;
  }

  /*for (let i = 0; i < Math.min(this.canvas_particles.length, 10000); i++) {
    const particle = this.canvas_particles[i];
    particle.draw(caller, this.uniforms, this.shapes, this.materials);
  }*/
  /*if (this.canvas_particles.length > 0) {
    console.log(this.canvas_particles[0]);
  }*/

  // this.particles[0].draw(caller, this.uniforms, this.shapes,
  // this.materials);

  //}

  // Render buttons, etc.
  render_controls() {
    // Create an HTML canvas that is invisible solely for reading RGB pixel
    // values.
    let canvas = document.createElement('canvas');
    canvas.setAttribute('style', 'display:none');
    canvas.setAttribute('id', 'canvasImg1');
    this.control_panel.appendChild(canvas);

    let image_upload = document.createElement('input');
    image_upload.setAttribute('type', 'file');
    image_upload.setAttribute('id', 'upload_image_1');
    this.control_panel.appendChild(image_upload);

    image_upload.addEventListener('change', save_to_canvas)
    let output = document.createElement('img');
    output.setAttribute('id', 'output');
    this.control_panel.appendChild(output);

    let image_upload2 = document.createElement('input');
    image_upload2.setAttribute('type', 'file');
    image_upload2.setAttribute('id', 'upload_image_2');
    this.control_panel.appendChild(image_upload2);

    image_upload2.addEventListener('change', save_to_canvas)
    let output2 = document.createElement('img');
    output2.setAttribute('id', 'output2');
    this.control_panel.appendChild(output2);

    this.new_line();
    this.key_triggered_button('Simulate', [], this.begin_sim);
    this.new_line();
    this.key_triggered_button('Return to Home', [], this.return_to_home);
    this.new_line();
    this.key_triggered_button('Fullscreen', [], this.fullscreen);
    this.new_line();
    this.key_triggered_button('Curl', [], this.curl_set);
    this.new_line();
    this.key_triggered_button('Fluid', [], this.fluid_set);
    this.new_line();
    this.key_triggered_button('Color Interpolate', [], this.color_int);
    this.new_line();
    this.key_triggered_button('Brownian Motion', [], this.brownian_motion_set);
  }

  reset_vals() {
    this.returnHome = false;
    this.fluid = false;
    this.curl = false;
    this.brownian = false;
  }

  begin_sim() {
    this.reset_vals();
    this.simulate = true;
  }
  // Save uploaded image to createthis.curld canvas for parsing.

  return_to_home() {
    this.reset_vals();
    this.simulate = false;
    this.returnHome = true;
    // this.returnHome = !this.returnHome;
  }

  curl_set() {
    this.reset_vals();
    this.simulate = false;
    this.curl = true;
  }

  fluid_set() {
    this.reset_vals();
    this.simulate = false;
    this.fluid = true;
  }
  brownian_motion_set() {
    this.reset_vals();
    this.simulate = false;
    this.brownian = true;
  }
  color_int() {
    this.color_interp = !this.color_interp;
  }

  fullscreen() {
    this.fullscreenTog = !this.fullscreenTog;
    this.has_refocused = false;
  }
}
