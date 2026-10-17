import { Suspense } from 'react';
import Invitation from '@/components/Invitation';
export default function Page() {
  return <Suspense fallback={<main className="loading-page"><span className="monogram">N & H</span><p>Your invitation is on its way…</p></main>}>
    <Invitation />
  </Suspense>;
}
