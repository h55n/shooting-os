import { notFound } from 'next/navigation';
import { getContentItem } from '@/lib/repositories/content';
import { ShootingViewClient } from '@/components/ShootingViewClient';

export const dynamic = 'force-dynamic';

export default async function ShootingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getContentItem(id);
  if (!item?.script) notFound();
  return <ShootingViewClient contentId={item.id} title={item.title} script={item.script} />;
}
