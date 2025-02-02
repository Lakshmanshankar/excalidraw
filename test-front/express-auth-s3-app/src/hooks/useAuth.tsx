import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { SERVER_URL } from "../consts";
import { Key } from "./ReactQuery";
import { useQuery } from "@tanstack/react-query";

type AuthContext = {
  isPending: boolean;
  error: unknown;
  user: {
    name: string;
    email: string;
    id: string;
    image: string;
    expires: string;
  };
};

const authContext = createContext({ user: {} } as unknown as AuthContext);
const { Provider } = authContext;

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const auth = useAuthProvider();
  if (auth !== null) {
    return <></>;
  }
  return <Provider value={auth}>{children}</Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

const useAuthProvider = () => {
  //const [user, setUser] = useState<AuthContext | null>(null);

  const { isPending, error, data } = useQuery({
    queryKey: [Key.AUTH_USER],
    queryFn: () =>
      fetch(`${SERVER_URL}/api/auth/session`).then((res) => res.json()),
  });

  return {
    isPending,
    error,
    data,
  };
};
