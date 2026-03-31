
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
