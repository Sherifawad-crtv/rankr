import { redirect } from "next/navigation";

export default function Home() {
  // TODO(spec): point back to /plans once the sign-up funnel is the public entry.
  redirect("/dashboard");
}
