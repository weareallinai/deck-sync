import { Button } from '@deck/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Deck Sync</h1>
        <p className="text-gray-600 mb-8">Real-time synchronized presentations</p>
        <div className="flex gap-4 justify-center">
          <Link href="/editor/demo">
            <Button>Open Editor</Button>
          </Link>
          <Link href="/present/demo">
            <Button variant="secondary">Open Presenter</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

