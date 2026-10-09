import { auth } from "@/lib/auth";
import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null; // middleware already guards this route

  let user: Awaited<ReturnType<typeof db.getUserById>> = null;
  let dataLoadError = false;

  try {
    user = await db.getUserById(session.user.id);
  } catch (error) {
    console.error("ProfilePage: failed to load user profile", error);
    dataLoadError = true;
  }

  if (dataLoadError || !user) {
    return (
      <>
        <PageHeader eyebrow="Portal" title="My Profile" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-lg rounded border border-brand-warning/30 bg-brand-warning/10 p-6 text-sm">
            We couldn&apos;t load your profile right now. Please refresh the page or try again in a few minutes.
          </div>
        </Container>
      </>
    );
  }

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
