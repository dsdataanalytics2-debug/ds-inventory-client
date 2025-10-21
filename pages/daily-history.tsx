import Head from 'next/head';
import Navbar from '../components/Navbar';
import DailyHistory from '../components/DailyHistory';
import ProtectedRoute from '../components/ProtectedRoute';

export default function DailyHistoryPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Daily History - Inventory Management</title>
        <meta name="description" content="Daily add and sell history overview" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="min-h-screen bg-gray-100">
        <div className="py-6">
          <DailyHistory />
        </div>
      </main>
    </ProtectedRoute>
  );
}
