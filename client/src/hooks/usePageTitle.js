import { useEffect } from 'react';

// Small hook to dynamically update and reset the document title per route
export function usePageTitle(title) {
  useEffect(() => {
    const original = document.title;
    document.title = title ? `${title} | MediLink` : 'MediLink';
    return () => {
      document.title = original;
    };
  }, [title]);
}

export default usePageTitle;
