import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function CrmIndexPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    router.replace(session ? "/crm/dashboard" : "/crm/login");
  }, [router, session]);

  return null;
}
