// pages/crm/login.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession, signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import PublicLayout from "@/components/layouts/PublicLayout";
import { ERRORS } from "@/lib/constants/errors";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const result = await signIn("credentials", {
      redirect: false,
      email: credentials.email,
      password: credentials.password,
    });

    setLoading(false);

    if (!result?.ok && result?.error) {
      setErrorMessage(ERRORS[result.error] || ERRORS.Default);
    } else {
      router.push("/crm/dashboard");
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const { error } = router.query;

    if (error) {
      toast.error(ERRORS[error] || ERRORS.Default);
    }
  }, [router.query]);

  return (
    <PublicLayout>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Вход для сотрудников
        </Typography>

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          required
          value={credentials.email}
          onChange={handleChange}
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Пароль"
          name="password"
          type="password"
          required
          value={credentials.password}
          onChange={handleChange}
          disabled={loading}
        />

        {errorMessage && (
          <Typography color="error" align="center">
            {errorMessage}
          </Typography>
        )}

        <Button fullWidth variant="contained" size="large" type="submit" disabled={loading} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : "Войти"}
        </Button>
      </Box>
    </PublicLayout>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: {
        destination: "/crm/dashboard",
        permanent: false,
      },
    };
  }

  return { props: {} };
}
