import Link from 'next/link';
import { Button } from '@/components/ui';
interface PageNavigationProps {
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
  home?: { label: string; href: string };
}
export default function PageNavigation({ prev, next, home }: PageNavigationProps) {
  return (
    <div className="mt-8 flex justify-between">
      {prev ? (
        <Link href={prev.href}>
          <Button variant="outline" className="border-gray-700 dark:border-primary-500 text-gray-300 dark:text-primary-400 hover:bg-[#1C1C26] dark:hover:bg-primary-900/20">
            ← {prev.label}
          </Button>
        </Link>
      ) : (
        <div />
      )}
      {home && (
        <Link href={home.href}>
          <Button variant="ghost" className="text-gray-300 dark:text-foreground hover:bg-[#1C1C26] dark:hover:bg-muted">
            {home.label}
          </Button>
        </Link>
      )}
      {next ? (
        <Link href={next.href}>
          <Button variant="gradient">{next.label} →</Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
