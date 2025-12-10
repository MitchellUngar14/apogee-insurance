// src/app/page.tsx
import { auth } from '@/lib/auth';
import IntroHome from '@/components/IntroHome';

export default async function Home() {
  const session = await auth();
  
  // Get user roles from session
  const userRoles = session?.user?.roles || [];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <IntroHome userRoles={userRoles} />
    </div>
  );
}
