import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import LinearProgress from "@mui/material/LinearProgress";

export default function AuthGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // if (status === "unauthenticated") {
    //   router.push("/crm/login");
    // }
  }, [router, status]);

  if (status === "loading") {
    return <LinearProgress />;
  }

  return children;
}
