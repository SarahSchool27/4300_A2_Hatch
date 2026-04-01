import { default as gulls } from 'https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js'
import { default as Video    } from './gulls/video.js'
import { default as Mouse    } from './gulls/mouse.js'


  async function run() {
  // start seagulls, by default it will use the first <canvas> element it
  // finds in your HTML page
  const sg = await gulls.init()

  // a simple vertex shader to make a quad
  const quadVertexShader = gulls.constants.vertex


  // our fragment shader, header contains bindings
  /*const fragmentShader = `
   @group(0) @binding(0) var<uniform> res : vec2f;
   @group(0) @binding(1) var<uniform> frame : f32;
   @group(0) @binding(2) var<uniform> slider : f32;
    @group(0) @binding(3) var backSampler: sampler;
    @group(0) @binding(4) var backBuffer: texture_2d<f32>;
    @group(0) @binding(5) var<uniform> mouse : vec3f;

    // NOTE THAT THERE IS A DIFFERENT GROUP NUMBER FOR THE
    // VIDEO TEXTURE BELOW. This lets gulls easily rebind
    // the texture for each frame, without having to rebind
    // the other variables in group 0. Given the new group,
    // the binding index resets to 0.
    @group(1) @binding(0) var videoBuffer:    texture_external;

    @fragment 
    fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
      return vec4f( mouse.x, mouse.y, mouse.z, 1. );
    
    
      }`*/
  //const fragmentShader =  await gulls.import('./shaders/header.wgsl') + await gulls.import( './shaders/default.wgsl' )
  const fragmentShader = 
    `
    @group(0) @binding(0) var<uniform> res : vec2f;
    @group(0) @binding(1) var<uniform> frame : f32;
    @group(0) @binding(2) var<uniform> slider : f32;
    @group(0) @binding(3) var backSampler: sampler;
    @group(0) @binding(4) var backBuffer: texture_2d<f32>;
    @group(0) @binding(5) var<uniform> mouse : vec3f;

    // NOTE THAT THERE IS A DIFFERENT GROUP NUMBER FOR THE
    // VIDEO TEXTURE BELOW. This lets gulls easily rebind
    // the texture for each frame, without having to rebind
    // the other variables in group 0. Given the new group,
    // the binding index resets to 0.
    @group(1) @binding(0) var videoBuffer:    texture_external;
    
    //Shader itself!!!!
    @fragment
    fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
      var p = pos.xy/res;
      

      var color = vec3f(0.);
      color += vec3(rippleGrid(p, 10, 10));
      return vec4(color,1.0);

    } 

    fn rippleGrid(p : vec2f, ripple_dens : f32, ripple_height : f32) -> vec3f{
      let PI = 3.14159;

      //grid code
      var mod_p = p;
      mod_p.y += sin(mod_p.x*ripple_dens)/ripple_height;
      var grid_pos = grid(mod_p, 20.0, 40.0); //multiplication for grid
      var color : vec3f = vec3f(0.0);
      color = abs(floor(grid_pos.y) % 2) * vec3(0.5,0.5,0.5); //has to be abs or flip results on the negative
      //p.x += 0.1 * floor(grid_pos.y) % 2;

      grid_pos = fract(grid_pos); //actually make grid
      
      //mod_p = p.xy * 0.5 + 0.5*p.xy/res; //weird results


      grid_pos += sin(PI*mod_p.y);
      let circles   = distance( grid_pos, vec2(.5) );
      let threshold = smoothstep( .25,.275, circles );

      color += vec3f(threshold);
      return color;
    
    }


    fn grid(p : vec2f, rows : f32, cols : f32) -> vec2f{
      var grid_pos: vec2f = vec2(p.x * cols, p.y * rows);
      return grid_pos;

    }


        
    //0 indexed
    fn isGridCoord(p : vec2f, query_row: f32, query_col: f32, rows : f32, cols : f32,)-> f32{
        var grid_pos: vec2f = vec2(p.x * cols, p.y * rows);


        //row, col
        if( floor(grid_pos.y) == query_row && floor(grid_pos.x) == query_col){
          return 1.0;
        } else {
        return 0.0;
        }


    }
  `

  // our vertex + fragment shader together
  const shader = quadVertexShader + fragmentShader



  //get data for uniforms
  const slider = document.querySelector('#slider')
  

  //create uniforms
  let u_frame = sg.uniform(0)
  let u_slider = sg.uniform(slider.value)

  // set initial mouse values
  // Mouse.values[0] = x coordinate (between 0-1)
  // Mouse.values[1] = y coorcinate (between 0-1)
  // Mouse.values[2] = left mouse button (either 0 or 1)
  Mouse.init()
  const u_mouse = sg.uniform( Mouse.values )
  
  //video
  await Video.init()


  //Back buffer 
  const back = new Float32Array( gulls.width * gulls.height * 4 ) //four floats per pixel (rgba)
  const t_feedback = sg.texture( back ) 
  

  // create a render pass
  const renderPass = await sg.render({ 
    shader,
    // add a data array to specify uniforms / buffers / textures etc.
    data:[
      sg.uniform([ window.innerWidth, window.innerHeight ]),
      u_frame,
      u_slider,
      sg.sampler(),
      t_feedback,
      u_mouse,
      sg.video( Video.element )
    ],
    //functions
    copy: t_feedback, //every frame copy frame to t_feedback

    onframe() {u_frame.value++;  u_mouse.value = Mouse.values}, //update frame count, update mouse pos
    //onframe() { u_mouse.value = Mouse.values } 

  })


  // our sliders value returns a string, so we'll convert it to a
  // floating point number with parseFloat()
  slider.oninput = ()=> u_slider.value = parseFloat( slider.value )

  // run our render pass
  sg.run( renderPass )
}

run()