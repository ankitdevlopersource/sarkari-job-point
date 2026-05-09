import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2"> 
        {items.map((item, index) => (
          <li key={item.label} className="inline-flex items-center">
            {item.to && !item.current ? (
              <Link to={item.to} className="text-gray-600 hover:text-red-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={item.current ? 'font-semibold text-slate-900' : 'text-gray-500'}>
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
