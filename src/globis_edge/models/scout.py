"""
Gemma 4 E2B Scout — llama-cpp-python wrapper implementing the ScoutModel protocol.

On a Raspberry Pi 5 with a GGUF model file this runs inference locally via
llama-cpp-python (CPU-only, n_gpu_layers=0).  In dev or when the model file is
absent it falls back to a deterministic stub so the rest of the stack can boot
and be tested without loading any weights.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Optional heavy dependency — graceful degradation when not installed.
# ---------------------------------------------------------------------------
try:
    from llama_cpp import Llama  # type: ignore[import-untyped]

    _LLAMA_AVAILABLE = True
except ImportError:
    _LLAMA_AVAILABLE = False
    Llama = None  # type: ignore[assignment,misc]


class GemmaScoutUnavailableError(RuntimeError):
    """Raised when Scout cannot satisfy a generate() call (no model, no stub)."""


class _StubBackend:
    """
    Deterministic offline stub used in dev / CI when the GGUF file is absent.

    Always returns a PASS verdict so that the auditor chain is exercised end-to-end
    without actual inference.  The stub signals its origin via the `stub` field
    in the JSON payload, which the PromptAuditor's _parse_verdict ignores
    (it only reads `verdict` and `reason`).
    """

    def generate(self, system_prompt: str, user_message: str) -> str:  # noqa: ARG002
        return json.dumps({
            "verdict": "PASS",
            "reason": "Stub backend — no model loaded (dev/offline mode).",
            "stub": True,
        })


class _LlamaBackend:
    """Thin wrapper around a loaded llama_cpp.Llama instance."""

    def __init__(self, llm: Any) -> None:
        self._llm = llm

    def generate(self, system_prompt: str, user_message: str) -> str:
        """
        Run a chat-formatted inference call and return the raw assistant text.

        Uses the chat-completion API (``create_chat_completion``) with the
        system + user roles so the model follows its instruction-tuned format.
        Temperature is pinned to 0 for deterministic audit verdicts.
        """
        response = self._llm.create_chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.0,
            max_tokens=256,
        )
        return response["choices"][0]["message"]["content"]


class GemmaScout:
    """
    Gemma 4 E2B inference wrapper.

    Implements the ``ScoutModel`` protocol expected by ``PromptAuditor``.

    Parameters
    ----------
    model_path:
        Filesystem path to the GGUF quantised model file.
        If the file does not exist the instance silently falls back to the
        deterministic stub so the API server can still boot and serve the demo.
    n_gpu_layers:
        Layers to offload to GPU.  0 = CPU-only (Raspberry Pi 5 default).
    n_ctx:
        Context window size.  2048 is sufficient for IER audit payloads.
    verbose:
        Pass through to llama-cpp verbosity.  Defaults to False to keep Pi
        logs clean.
    """

    def __init__(
        self,
        model_path: str | os.PathLike[str] = "",
        *,
        n_gpu_layers: int = 0,
        n_ctx: int = 2048,
        verbose: bool = False,
    ) -> None:
        self._model_path = Path(model_path) if model_path else None
        self._n_gpu_layers = n_gpu_layers
        self._n_ctx = n_ctx
        self._verbose = verbose
        self._backend: _StubBackend | _LlamaBackend | None = None

    # ------------------------------------------------------------------
    # Lazy initialisation — model is only loaded on first generate() call
    # so that importing this module has zero cost.
    # ------------------------------------------------------------------

    def _load(self) -> _StubBackend | _LlamaBackend:
        """Load the GGUF model or fall back to the stub."""
        model_present = (
            self._model_path is not None
            and self._model_path.exists()
            and self._model_path.stat().st_size > 0
        )

        if model_present and _LLAMA_AVAILABLE:
            llm = Llama(
                model_path=str(self._model_path),
                n_gpu_layers=self._n_gpu_layers,
                n_ctx=self._n_ctx,
                verbose=self._verbose,
            )
            return _LlamaBackend(llm)

        # Warn but don't crash — dev mode / demo without real weights
        if not model_present:
            reason = (
                f"model file not found at {self._model_path}"
                if self._model_path
                else "no model_path supplied"
            )
        else:
            reason = "llama-cpp-python not installed"

        import warnings
        warnings.warn(
            f"GemmaScout falling back to stub backend: {reason}. "
            "Audit Prompt Pass will always return PASS.",
            stacklevel=3,
        )
        return _StubBackend()

    @property
    def is_stub(self) -> bool:
        """True when running the deterministic stub rather than real inference."""
        if self._backend is None:
            return False
        return isinstance(self._backend, _StubBackend)

    # ------------------------------------------------------------------
    # ScoutModel protocol
    # ------------------------------------------------------------------

    def generate(self, system_prompt: str, user_message: str) -> str:
        """
        Run inference and return raw assistant text (expected to contain JSON).

        Lazy-loads the backend on first call.
        """
        if self._backend is None:
            self._backend = self._load()
        return self._backend.generate(system_prompt, user_message)
