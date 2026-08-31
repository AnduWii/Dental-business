"""The heavyweight test: synthetic session -> real training -> ONNX export ->
onnxruntime inference -> decoded key sets. Proves every seam in the pipeline.
Runs in well under a minute on CPU. Skipped automatically if torch is absent.
"""

import numpy as np
import pytest

torch = pytest.importorskip("torch")
ort = pytest.importorskip("onnxruntime")

from rusty_pilot.actions import decode_vector, sigmoid
from rusty_pilot.capture import frames_to_model_input
from rusty_pilot.config import Config
from rusty_pilot.export import read_sidecar
from rusty_pilot.smoke import make_synthetic_session
from rusty_pilot.train import train


@pytest.fixture(scope="module")
def trained(tmp_path_factory):
    base = tmp_path_factory.mktemp("smoke")
    config = Config(
        data_dir=str(base / "data"),
        models_dir=str(base / "models"),
        epochs=3,
        batch_size=64,
    )
    make_synthetic_session(config, base / "data", n_frames=1200, seed=config.seed)
    onnx_path = train(config, out_name="test_policy")
    return config, onnx_path


def test_training_exports_verified_onnx(trained):
    config, onnx_path = trained
    assert onnx_path.exists()
    assert onnx_path.with_suffix(".pt").exists()
    sidecar = read_sidecar(onnx_path)
    assert sidecar["action_keys"] == list(config.action_keys)


def test_onnx_inference_and_decode(trained):
    config, onnx_path = trained
    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    stack = np.random.default_rng(0).integers(
        0, 256, size=(config.frame_stack, config.frame_height, config.frame_width)
    ).astype(np.uint8)
    (logits,) = session.run(["logits"], {"frames": frames_to_model_input(stack)})
    assert logits.shape == (1, len(config.action_keys))
    keys = decode_vector(sigmoid(logits[0]), config.action_keys, config.action_threshold)
    assert keys <= set(config.action_keys)


def test_model_learned_the_synthetic_policy(trained):
    """The synthetic rule is 'a if square left, d if right, w if centered'. A wired-up
    trainer must beat chance comfortably on freshly generated frames."""
    config, onnx_path = trained
    from rusty_pilot.dataset import load_dataset_arrays

    x, y = load_dataset_arrays(config.data_dir, config.frame_stack)
    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    take = slice(0, 400)
    batch = x[take].astype(np.float32) / 255.0
    (logits,) = session.run(["logits"], {"frames": batch})
    probs = sigmoid(logits)
    # Score only the movement keys the synthetic policy actually uses.
    idx = [config.action_keys.index(k) for k in ("w", "a", "d")]
    pred = (probs[:, idx] >= 0.5).astype(np.float32)
    truth = y[take][:, idx]
    accuracy = float((pred == truth).mean())
    assert accuracy > 0.8, f"model failed to learn synthetic policy (acc={accuracy:.3f})"


def test_torch_and_onnx_agree(trained):
    """The exported graph must produce the same logits as the torch checkpoint."""
    config, onnx_path = trained
    from rusty_pilot.model import build_policy

    model = build_policy(
        config.frame_stack,
        len(config.action_keys),
        frame_height=config.frame_height,
        frame_width=config.frame_width,
    )
    state = torch.load(onnx_path.with_suffix(".pt"), weights_only=True)
    model.load_state_dict(state)
    model.eval()
    rng = np.random.default_rng(1)
    batch = rng.random(
        (2, config.frame_stack, config.frame_height, config.frame_width)
    ).astype(np.float32)
    with torch.no_grad():
        torch_logits = model(torch.from_numpy(batch)).numpy()
    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    (onnx_logits,) = session.run(["logits"], {"frames": batch})
    np.testing.assert_allclose(torch_logits, onnx_logits, rtol=1e-4, atol=1e-5)
