"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Icon } from "@/components/ui";
import { signOut as signOutRequest } from "@/lib/api";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";

/** Bottom of the sidebar: who is signed in (initial, name, role), then Sign out on its own. */
export function AccountFooter() {
  const { user, signOut } = useSession();
  const { t } = useLocale();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await signOutRequest();
    } finally {
      signOut();
      router.push("/sign-in");
      setSigningOut(false);
    }
  }

  return (
    <div className="mt-auto flex flex-col gap-3 border-t border-border-default pt-4">
      <div className="flex items-center gap-3 px-3">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">{user.name}</p>
          <p className="truncate text-sm text-text-secondary">{t(`role.${user.role}`)}</p>
        </div>
      </div>
      <Button variant="ghost" className="w-full justify-start" loading={signingOut} onClick={onSignOut}>
        <Icon name="logout" size={18} className="rtl:-scale-x-100" />
        {t("auth.signOut")}
      </Button>
    </div>
  );
}
