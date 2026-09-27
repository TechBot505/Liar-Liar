import type { JSX } from "react";
import { AuthScreen } from "@/components/profile/AuthScreen";

export default function SignInPage(): JSX.Element {
  return <AuthScreen mode="sign-in" />;
}
