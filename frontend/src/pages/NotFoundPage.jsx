import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="not-found-code">404</p>
      <h1>Page not found</h1>
      <Link to="/" className="btn btn-primary">
        Go home
      </Link>
    </main>
  );
}
