import { auth } from "@/lib/auth";
import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null; // middleware already guards this route

  const user = await db.getUserById(session.user.id);
  if (!user) return null;

  return (
    <>
      <PageHeader eyebrow="Portal" title="My Profile" />
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg">
          <ProfileForm initial={{ name: user.name ?? "", phone: user.phone ?? "", address: user.address ?? "" }} email={user.email} />
        </div>
      </Container>
    </>
  );
}
