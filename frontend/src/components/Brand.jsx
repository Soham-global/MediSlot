import { Link } from 'react-router-dom';

export default function Brand({ to = '/' }) {
  return (
    <Link to={to} className="brand" aria-label="MediSlot home">
      <span className="brand-mark" aria-hidden="true">
        +
      </span>
      <span className="brand-name">MediSlot</span>
    </Link>
  );
}
