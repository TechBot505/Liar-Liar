import type { JSX } from "react";
import { AuthScreen } from "@/components/profile/AuthScreen";

export default function SignUpPage(): JSX.Element {
  return <AuthScreen mode="sign-up" />;
}
