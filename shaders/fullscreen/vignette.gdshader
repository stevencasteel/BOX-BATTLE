shader_type canvas_item;

uniform vec4 vignette_color : source_color = vec4(0.7, 0.0, 0.0, 1.0);
uniform float intensity : hint_range(0.0, 1.0) = 0.0;
uniform float pulse_speed : hint_range(0.0, 10.0) = 3.0;

void fragment() {
	vec2 uv = SCREEN_UV - 0.5;
	float dist = length(uv);
	
	// FIX: Tightened gradient. 
	// Starts at 0.35 (near center) to ensure visibility.
	// Reaches full strength at 0.85 (visible corners). 
	// Previous was 1.2, which pushed the red too far off-screen.
	float mask = smoothstep(0.35, 0.85, dist);
	
	// Heartbeat Pulse Math
	float base_pulse = sin(TIME * pulse_speed);
	float heartbeat = pow(0.5 * (base_pulse + 1.0), 2.0); 
	
	float pulse_mod = 0.3 + (heartbeat * 0.7);
	
	vec4 output = vignette_color;
	output.a = mask * intensity * pulse_mod;
	
	COLOR = output;
}
