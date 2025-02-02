// Frontend - Signin.jsx
export default function Signin() {
  const SignIN = () => {
    // This will take user to the Auth.js signin page
    window.location.href = "http://localhost:3000/api/auth/signin";
  };
const SignOUt = () => {
    // This will take user to the Auth.js signin page
    window.location.href = "http://localhost:3000/api/auth/signin";
  };
  const handleSignIn = async () => {
    try {
      // Making request to auth.js signin endpoint
      const csrfToken = await getCsrfToken();
      const res = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        credentials: "include", // Important for cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          // If using credentials provider
          email: "user@example.com",
          password: "password",
          // If using OAuth, specify the provider
          provider: "google", // or 'github', etc.
        }),
      });

      if (res.ok) {
        const session = await res.json();
        console.log("Signed in:", session);

        // You can now make authenticated requests
        const protectedData = await fetch(
          "http://localhost:3000/api/protected",
          {
            credentials: "include", // Important for sending auth cookies
          },
        );

        if (protectedData.ok) {
          const data = await protectedData.json();
          console.log("Protected data:", data);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        console.log("Signed out successfully");
      }
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  return (
    <div>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={SignIN}>ActallSign In</button>
      <button onClick={SignOUt}>Sign Out</button>
    </div>
  );
}

const getCsrfToken = async () => {
  const response = await fetch("http://localhost:3000/api/auth/csrf", {
    credentials: "include",
  });
  const { csrfToken } = await response.json();
  return csrfToken;
};

