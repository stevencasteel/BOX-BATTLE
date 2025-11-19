shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
uniform float offset_strength : hint_range(0.0, 50.0) = 2.0;
uniform float fx_progress : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	// Center Mask: Prevent warping in the middle of the screen
	float dist = length(SCREEN_UV - 0.5);
	// smoothstep(inner_radius, outer_radius, value)
	// This creates a hole in the center (0.0) blending to full strength (1.0) at the edges
	float center_mask = smoothstep(0.0, 0.6, dist);

	// Apply mask to intensity
	float intensity = fx_progress * offset_strength * center_mask;

	vec2 uv = SCREEN_UV;
	
	// Simple blur approximation: sample further apart for R/B channels
	vec4 red = texture(screen_texture, uv + vec2(SCREEN_PIXEL_SIZE.x * intensity, 0.0));
	vec4 green = texture(screen_texture, uv);
	vec4 blue = texture(screen_texture, uv - vec2(SCREEN_PIXEL_SIZE.x * intensity, 0.0));
	
	COLOR = vec4(red.r, green.g, blue.b, 1.0);
}
