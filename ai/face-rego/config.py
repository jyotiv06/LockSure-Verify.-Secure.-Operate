# Face verification configuration

MODEL_NAME = "ArcFace"
DETECTOR_BACKEND = "opencv"
DISTANCE_METRIC = "cosine"

# DeepFace uses its model-specific threshold automatically.
# We do not manually override it.
USE_ALIGNMENT = True

# Image quality settings
MIN_IMAGE_WIDTH = 160
MIN_IMAGE_HEIGHT = 160

# Laplacian variance threshold.
# This is a starting point and can be adjusted after testing.
BLUR_THRESHOLD = 50.0

# Confidence levels used by our application layer.
HIGH_CONFIDENCE = 0.90
MEDIUM_CONFIDENCE = 0.75