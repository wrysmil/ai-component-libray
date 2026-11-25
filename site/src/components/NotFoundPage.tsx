import { Link } from 'react-router-dom';

export interface NotFoundPageProps {
  /** Optional hint about what was not found. */
  reason?: string;
}

/** The 404 page of the site. */
export function NotFoundPage({ reason }: NotFoundPageProps) {
  return (
    <section className="not-found">
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__text">
        {reason ??
          'The page you are looking for does not exist. It may have been renamed or removed.'}
      </p>
      <Link className="button button--primary" to="/">
        Back to the catalog
      </Link>
    </section>
  );
}

export default NotFoundPage;
