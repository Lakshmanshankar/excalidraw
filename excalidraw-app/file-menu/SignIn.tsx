import { useAuthUser } from "./hooks/useAuth";
import { SERVER_URL } from "./consts";
import {
  loginIcon,
  SignOutIcon,
} from "../../packages/excalidraw/components/icons";
import { Button } from "../../packages/excalidraw";
import DropdownMenu from "../../packages/excalidraw/components/dropdownMenu/DropdownMenu";

export default function SignIn() {
  const { data } = useAuthUser();
  const signIn = () => {
    window.location.href = `${SERVER_URL}/api/auth/signin`;
  };
  const signOut = () => {
    window.location.href = `${SERVER_URL}/api/auth/signout`;
  };
  if (!data) {
    return (
      <DropdownMenu.Item
        onSelect={signIn}
        icon={loginIcon}
        data-testid="load-button"
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        Sign In
      </DropdownMenu.Item>
    );
  }
  return (
    <>
      <DropdownMenu.Separator />
      <DropdownMenu.Group>
        <div
          className="auth-user-banner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {data?.user?.name}
          <Button onSelect={signOut}> {SignOutIcon} </Button>
        </div>
      </DropdownMenu.Group>
    </>
  );
}
