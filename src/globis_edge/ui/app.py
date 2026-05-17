"""PySide6 native desktop shell for Globis Edge on Raspberry Pi."""

from __future__ import annotations

from dataclasses import dataclass

from globis_edge.ui.session import SessionLockManager

try:
    from PySide6.QtWidgets import QApplication, QLabel, QMainWindow, QStackedWidget, QVBoxLayout, QWidget
except Exception:  # pragma: no cover - optional runtime dependency
    QApplication = None  # type: ignore[assignment]
    QLabel = None  # type: ignore[assignment]
    QMainWindow = object  # type: ignore[assignment,misc]
    QStackedWidget = None  # type: ignore[assignment]
    QVBoxLayout = None  # type: ignore[assignment]
    QWidget = None  # type: ignore[assignment]


@dataclass(frozen=True)
class DashboardSnapshot:
    """Read-only dashboard status model."""

    api_up: bool
    db_ready: bool
    governance_ok: bool
    ssid: str
    ap_ip: str
    quarantine_unreviewed: int


class GlobisEdgeWindow(QMainWindow):
    """Minimal three-screen shell: dashboard -> login -> guided turn."""

    def __init__(self, session: SessionLockManager) -> None:
        if QWidget is None:
            raise RuntimeError("PySide6 is required to launch the native UI")
        super().__init__()
        self._session = session
        self.setWindowTitle("Globis Edge OS")
        self._stack = QStackedWidget()
        self.setCentralWidget(self._stack)
        self._stack.addWidget(self._build_screen("Status Dashboard"))
        self._stack.addWidget(self._build_screen("PIN Login"))
        self._stack.addWidget(self._build_screen("Guided Reception Turn"))
        self._stack.setCurrentIndex(0)

    def _build_screen(self, title: str) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.addWidget(QLabel(title))
        return widget


def run_native_ui(pin: str) -> int:
    """Launch desktop UI. Returns process exit code."""
    if QApplication is None:
        raise RuntimeError("PySide6 is not available in this environment")
    app = QApplication([])
    window = GlobisEdgeWindow(SessionLockManager(pin=pin))
    window.showFullScreen()
    return app.exec()
