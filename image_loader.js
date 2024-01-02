// Class for initial load of the image and saving as a canvas.
import {defs, tiny} from './examples/common.js';
import {Particle} from './particle.js'

const default_canvas = 'canvasImg1'
let readers = [];
export const save_to_canvas =
    defs.save_to_canvas = function save_to_canvas(event) {
      const generate_canvas = function(result) {
        let canvas = document.getElementById(default_canvas);
        let ctxt = canvas.getContext('2d');
        let img = new Image;
        img.src = result;
        img.onload = function() {
          // We also want to save the parameters.
          ctxt.drawImage(img, 0, 0);
          readers.push(new CanvasReader(this.width, this.height));
        }
      };
      const output = document.getElementById('output');
      const file_list = event.target.files;
      const file = file_list[0];
      const reader = new FileReader();
      const on_load = function(event) {
        // Instead we want to draw this image to an invisible canvas that we
        // create so we can subsample it for pixels.
        let result = event.target.result;
        generate_canvas(result);
      };
      reader.addEventListener('load', on_load.bind(reader));
      reader.readAsDataURL(file);
    }

export const get_readers = defs.get_readers = function get_reader(){
    return readers;
}


class CanvasReader{
    constructor(width, height, canvas_id = default_canvas){
        this.width = width;
        this.height = height;
        this.canvas_id = canvas_id;
        // Load in the given arrays from the canvas for easily getting pixels.
        this.init();
    }
    init(){
        let canvas = document.getElementById(this.canvas_id);
        let ctx = canvas.getContext('2d');
        const image_data = ctx.getImageData(0,0, this.width, this.height);
        this.data = image_data.data;
    }
    // Array is height x width x 4 bytes.
    // Each pixel value will be of form (0-255, 0-255, 0-255).
    get_pixel(x, y){
        // Return an RGB coordinate.
        // X is the column while y is the height.
        const offset = ((y * (this.width * 4)) + (x * 4));
        const rgb = [this.data[offset], this.data[offset+1], this.data[offset+2]];
        return rgb;
    }
};

