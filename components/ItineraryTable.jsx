function RowActions({
  onInsertAbove,
  onInsertBelow,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const toggleMenu = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 6,
      left: rect.right - 170,
    });

    setOpen((prev) => !prev);
  };

  return (
    <>
      {/* BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim transition"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {/* MENU */}
      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            {/* BACKDROP */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setOpen(false)}
            />

            {/* DROPDOWN */}
            <div
              className="fixed z-[9999] w-44 overflow-hidden rounded-2xl border border-paper-line bg-white shadow-2xl"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onInsertAbove();
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-paper-dim transition"
              >
                ↑ Insert Above
              </button>

              <button
                type="button"
                onClick={() => {
                  onInsertBelow();
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-paper-dim transition"
              >
                ↓ Insert Below
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 transition"
              >
                🗑 Delete Row
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
}