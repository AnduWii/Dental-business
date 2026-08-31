"""Export a trained policy to ONNX, the downloadable/portable model format.

The .onnx file is self-contained: agent.py (and anything else that speaks ONNX)
can run it without torch installed. Metadata about the action space and frame
geometry rides along in a sidecar JSON so a model can never be silently run with
the wrong key ordering.
"""

from __future__ import annotations

import json
from pathlib import Path

from .config import Config


def sidecar_path(onnx_path: str | Path) -> Path:
    return Path(onnx_path).with_suffix(".json")


def write_sidecar(onnx_path: str | Path, config: Config) -> None:
    sidecar_path(onnx_path).write_text(
        json.dumps(
            {
                "action_keys": list(config.action_keys),
                "frame_stack": config.frame_stack,
                "frame_width": config.frame_width,
                "frame_height": config.frame_height,
                "capture_fps": config.capture_fps,
                "input_name": "frames",
                "output_name": "logits",
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def read_sidecar(onnx_path: str | Path) -> dict:
    path = sidecar_path(onnx_path)
    if not path.exists():
        raise FileNotFoundError(
            f"missing model sidecar {path}; re-export the model with rusty_pilot train"
        )
    return json.loads(path.read_text(encoding="utf-8"))


def export_onnx(model, config: Config, onnx_path: str | Path) -> Path:
    """Export `model` (a torch Module) to ONNX with a dynamic batch axis."""
    import torch

    onnx_path = Path(onnx_path)
    onnx_path.parent.mkdir(parents=True, exist_ok=True)
    model.eval()
    dummy = torch.zeros(
        1, config.frame_stack, config.frame_height, config.frame_width
    )
    export_kwargs = dict(
        input_names=["frames"],
        output_names=["logits"],
        dynamic_axes={"frames": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
    )
    try:
        # torch >= 2.9 defaults to the dynamo exporter, which deprecates
        # dynamic_axes; pin the legacy exporter explicitly.
        torch.onnx.export(model, dummy, str(onnx_path), dynamo=False, **export_kwargs)
    except TypeError:
        # torch < 2.2 has no `dynamo` kwarg; the legacy exporter is the default.
        torch.onnx.export(model, dummy, str(onnx_path), **export_kwargs)
    write_sidecar(onnx_path, config)
    return onnx_path


def verify_onnx(onnx_path: str | Path, config: Config) -> bool:
    """Run one dummy inference through onnxruntime to prove the file is loadable."""
    import numpy as np
    import onnxruntime as ort

    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    dummy = np.zeros(
        (1, config.frame_stack, config.frame_height, config.frame_width),
        dtype=np.float32,
    )
    (logits,) = session.run(["logits"], {"frames": dummy})
    return logits.shape == (1, len(config.action_keys))
