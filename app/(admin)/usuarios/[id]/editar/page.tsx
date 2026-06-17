import { redirect } from 'next/navigation';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/usuarios/${id}`);
}
