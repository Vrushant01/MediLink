import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { usePageTitle } from '../hooks/usePageTitle';

// 404 page for unmatched routes with a clean fallback navigation link home
export default function NotFound() {
  usePageTitle('Page Not Found');
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
      <div className="panel bg-surface max-w-md w-full p-8 border border-line">
        <span className="text-[13px] font-sans font-medium text-ink-soft block mb-2">
          Error 404
        </span>
        <h1 className="page-title text-ink mb-2">Page not found</h1>
        <p className="body-ui text-ink-soft mb-6">
          The requested page could not be located. It may have moved or the address may be mistyped.
        </p>
        <Link to="/">
          <Button variant="primary">
            Return home
          </Button>
        </Link>
      </div>
    </div>
  );
}
