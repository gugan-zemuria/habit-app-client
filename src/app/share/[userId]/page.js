'use client';

import { useParams } from 'next/navigation';
import PublicShareView from '../../../components/PublicShareView';

export default function PublicSharePage() {
  const params = useParams();
  const userId = params.userId;

  return (
    <div className="public-share-page">
      <PublicShareView userId={userId} />
    </div>
  );
}