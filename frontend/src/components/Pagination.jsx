// page is 0-based (same as the backend)
export default function Pagination({
  page,
  totalPages,
  totalElements,
  label = 'items',
  onChange,
}) {
  if (totalElements === 0) return null;

  return (
    <nav className="pager" aria-label="Pagination">
      <p className="muted">
        {totalElements} {label} · Page {page + 1} of {Math.max(totalPages, 1)}
      </p>
      <div className="pager-buttons">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={page <= 0}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={page + 1 >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
