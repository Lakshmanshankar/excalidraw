import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("http://localhost:3000/api/auth/session", {
        credentials: "include",
      });
      if (res.ok) {
        const session = await res.json();
        setUser(session.user);
      }
    };

    checkAuth();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          Welcome, {user.email}
          {JSON.stringify(user, null, 4)}
        </div>
      ) : (
        <a
          href="http://localhost:3000/api/auth/signin"
          className="bg-red-100 flex"
        >
          Sign In
        </a>
      )}
    </div>
  );
}
