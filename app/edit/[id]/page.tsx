import EditLayout from '@/components/edit/EditLayout';
import { db } from '@/libs/DB';
import { eq } from 'drizzle-orm';
import { displaySchema } from '@/models/Schema';

interface EditProps {
  params: Promise<{ id: string }>
}

export default async function Edit({ params }: EditProps) {
  const { id } = await params;
  const data = await db
    .query
    .displaySchema
    .findFirst({
      where: eq(displaySchema.id, Number(id)),
    });
  const displayData = data?.displayData ? JSON.parse(data.displayData) : null;
  return (
    <>
      {displayData ? <EditLayout displayId={id} displayData={displayData}></EditLayout> : <div>无数据</div>}
    </>
  )
}
