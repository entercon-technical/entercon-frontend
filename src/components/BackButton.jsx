import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    const canGoBack = window.history.state?.idx > 0;

    navigate(canGoBack ? -1 : "/dashboard");
  };

  return (
    <button
      type="button"
      aria-label="Go back"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900 shadow-sm transition duration-200 ease-out hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:gap-2 sm:px-4 sm:text-sm"
      onClick={handleBack}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center text-slate-700">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path d="M10.707 14.707a1 1 0 0 1-1.414 0L4.586 10l4.707-4.707a1 1 0 1 1 1.414 1.414L7.414 10l3.293 3.293a1 1 0 0 1 0 1.414z" />
        </svg>
      </span>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
};

export default BackButton;
