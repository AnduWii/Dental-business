"""Task engine package. Import submodules directly (rusty_pilot.tasks.engine,
rusty_pilot.tasks.library); nothing is re-exported here so that importing the
package never drags in OpenCV, which keeps `init` and `check` working on a
machine where opencv-python is not installed yet.
"""
