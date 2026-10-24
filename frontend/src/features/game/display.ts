/** Fullscreen uses a section inside the modal: native dialogs cannot be fullscreen targets. */
export class GameDisplay {
  private wanted = false;
  private busy = false;
  private events = new AbortController();
  private disposed = false;
  private dialog: HTMLDialogElement;
  private panel: HTMLElement;
  private button: HTMLButtonElement;
  private onChange: () => void;

  constructor(
    dialog: HTMLDialogElement,
    panel: HTMLElement,
    button: HTMLButtonElement,
    onChange: () => void,
  ) {
    this.dialog = dialog; this.panel = panel; this.button = button; this.onChange = onChange;
    const signal = this.events.signal;
    button.addEventListener(
      "click",
      () => {
        void this.toggle();
      },
      { signal },
    );
    document.addEventListener(
      "fullscreenchange",
      () => {
        if (
          document.fullscreenElement === this.panel &&
          (!this.wanted || !this.dialog.open)
        ) {
          this.exit();
          return;
        }
        if (
          !document.fullscreenElement &&
          !dialog.classList.contains("is-expanded")
        )
          this.wanted = false;
        this.update();
      },
      { signal },
    );
    this.update(false);
  }
  get expanded(): boolean {
    return (
      this.dialog.classList.contains("is-expanded") ||
      document.fullscreenElement === this.panel
    );
  }
  private update(notify = true): void {
    if (this.disposed) return;
    const active = this.expanded;
    this.button.setAttribute("aria-pressed", String(active));
    this.button.setAttribute(
      "aria-label",
      active ? "Exit fullscreen" : "Fullscreen game",
    );
    this.button.title = active ? "Exit fullscreen" : "Fullscreen game";
    this.button.textContent = active ? "⤡" : "⤢";
    if (notify) this.onChange();
  }
  private async toggle(): Promise<void> {
    if (this.busy || this.disposed || !this.dialog.open) return;
    if (this.expanded) {
      this.exit();
      return;
    }
    this.wanted = true;
    this.busy = true;
    this.onChange();
    try {
      if (
        document.fullscreenEnabled &&
        typeof this.panel.requestFullscreen === "function"
      ) {
        try {
          await this.panel.requestFullscreen();
          if (!this.wanted || !this.dialog.open || this.disposed) this.exit();
          else this.update();
          return;
        } catch {
          /* Use a viewport-sized modal when fullscreen is unsupported or denied. */
        }
      }
      if (this.wanted && this.dialog.open && !this.disposed) {
        this.dialog.classList.add("is-expanded");
        this.update();
      }
    } finally {
      this.busy = false;
    }
  }
  exit(): void {
    this.wanted = false;
    this.dialog.classList.remove("is-expanded");
    if (
      document.fullscreenElement === this.panel &&
      typeof document.exitFullscreen === "function"
    )
      void document.exitFullscreen().catch(() => {});
    this.update();
  }
  destroy(): void {
    this.exit();
    this.disposed = true;
    this.events.abort();
  }
}
