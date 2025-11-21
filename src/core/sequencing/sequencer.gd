# src/core/sequencing/sequencer.gd
## An autoloaded singleton that runs linear sequences of timed events.
##
## It is used for cinematic moments like boss intros. It tracks all active
## sequences and can safely cancel them, preventing errors during scene transitions.
extends Node

# --- Private Member Variables ---
var _active_handles: Array[SequenceHandle] = []

# --- Public Methods ---


## Executes a series of [SequenceStep] resources and returns a handle.
func run_sequence(steps: Array[SequenceStep]) -> SequenceHandle:
	var handle = SequenceHandle.new()
	_active_handles.append(handle)
	handle.finished.connect(_on_sequence_finished.bind(handle))

	_execute_sequence(steps, handle)
	return handle


## Immediately cancels all running sequences.
func cancel_all() -> void:
	# Iterate over a copy, as cancelling a handle modifies the original array via signal.
	var current_handles = _active_handles.duplicate()
	for handle in current_handles:
		if is_instance_valid(handle):
			handle.cancel()
	
	_active_handles.clear()


# --- Private Methods ---


## The core async function that executes the sequence steps.
func _execute_sequence(steps: Array[SequenceStep], handle: SequenceHandle) -> void:
	if steps.is_empty():
		if handle.is_running:
			handle.is_running = false
			handle.finished.emit()
		return

	for step in steps:
		# 1. Check before execution
		if not handle.is_running:
			return

		if not step is SequenceStep:
			push_warning("Sequencer: Invalid step found. Skipping.")
			continue

		# 2. Execute the step
		var awaitable = await step.execute(self)
		
		# 3. Wait if the step returned a signal/coroutine
		if awaitable:
			await awaitable
		
		# 4. CRITICAL: Check again after the wait. 
		# The sequence might have been cancelled while we were waiting.
		if not handle.is_running: 
			return

	# 5. Finish successfully
	if handle.is_running:
		handle.is_running = false
		handle.finished.emit()


# --- Signal Handlers ---


## Cleans up a finished or cancelled sequence from the tracking array.
func _on_sequence_finished(handle_to_remove: SequenceHandle) -> void:
	if _active_handles.has(handle_to_remove):
		_active_handles.erase(handle_to_remove)
