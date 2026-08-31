"""The policy network: a small CNN that maps a stack of grayscale frames to
independent per-key logits (multi-label, sigmoid at inference time).

Small on purpose: under a million parameters trains in minutes on a CPU and runs
at well over 100 inferences/second through onnxruntime, far faster than the 10 Hz
control loop needs.
"""

from __future__ import annotations


def build_policy(frame_stack: int, n_actions: int, frame_height: int = 72, frame_width: int = 128):
    """Returns a torch.nn.Module. Torch is imported here, not at module import.

    The classifier head's input size is computed with a dummy forward pass, so any
    frame_width/frame_height in config works without touching code. (Deliberately
    no AdaptiveAvgPool: ONNX has no adaptive-pool op, so the exporter rejects it
    whenever the conv output does not divide the target size evenly.)
    """
    import torch
    import torch.nn as nn

    features = nn.Sequential(
        nn.Conv2d(frame_stack, 16, kernel_size=5, stride=2, padding=2),
        nn.ReLU(inplace=True),
        nn.Conv2d(16, 32, kernel_size=3, stride=2, padding=1),
        nn.ReLU(inplace=True),
        nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
        nn.ReLU(inplace=True),
        nn.Conv2d(64, 64, kernel_size=3, stride=2, padding=1),
        nn.ReLU(inplace=True),
    )
    with torch.no_grad():
        flat_dim = features(torch.zeros(1, frame_stack, frame_height, frame_width)).numel()

    class PolicyNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.features = features
            self.head = nn.Sequential(
                nn.Flatten(),
                nn.Linear(flat_dim, 256),
                nn.ReLU(inplace=True),
                nn.Dropout(0.1),
                nn.Linear(256, n_actions),
            )

        def forward(self, x):  # x: (B, frame_stack, H, W) in [0, 1]
            return self.head(self.features(x))

    return PolicyNet()
