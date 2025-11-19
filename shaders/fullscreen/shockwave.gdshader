shader_type canvas_item;

uniform vec2 center = vec2(0.5, 0.5);
uniform float force : hint_range(0.0, 0.5) = 0.05;
uniform float fx_progress : hint_range(0.0, 1.0) = 0.0;
uniform float thickness : hint_range(0.0, 0.5) = 0.1;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;

void fragment() {
	// FIX: Optimization/Bugfix. If progress is 0, do no math, return original pixel.
	// This prevents the "center warping" artifact when the effect is idle.
	if (fx_progress <= 0.001) {
		COLOR = texture(screen_texture, SCREEN_UV);
	} else {
		float ratio = SCREEN_PIXEL_SIZE.x / SCREEN_PIXEL_SIZE.y;
		vec2 scaled_uv = (SCREEN_UV - vec2(0.5, 0.0)) / vec2(ratio, 1.0) + vec2(0.5, 0.0);
		vec2 scaled_center = (center - vec2(0.5, 0.0)) / vec2(ratio, 1.0) + vec2(0.5, 0.0);
		
		float dist = length(scaled_uv - scaled_center);
		
		float ripple_freq = 20.0; 
		float ripple = sin((dist - fx_progress) * ripple_freq);
		float mask = smoothstep(0.25, 0.0, abs(dist - fx_progress));
		float dist_scale = 1.0 + (dist * 2.0); 
		
		vec2 disp = normalize(scaled_uv - scaled_center) * ripple * force * mask * dist_scale;
		
		COLOR = texture(screen_texture, SCREEN_UV - disp);
	}
}
