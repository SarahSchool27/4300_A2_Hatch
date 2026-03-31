@fragment
    fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
      let p = pos.xy / res;

      let video = textureSampleBaseClampToEdge( videoBuffer, backSampler, p );

      let fb = textureSample( backBuffer, backSampler, p );

      let out = video * .05 + fb * .975;

      return vec4f( out.rgb, 1. );