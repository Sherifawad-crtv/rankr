"use client";

import { useCallback, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  Segmented,
  TierSlider,
  useToast,
  type Column,
} from "@/components/ui";
import { PriceDisplay } from "@/components/plans/price-display";
import { getBillingOverview, updatePlan } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAsync } from "@/lib/hooks/use-async";
import { formatDate } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatPrice } from "@/lib/pricing";
import { useSession } from "@/lib/session";
import {
  ENTERPRISE_CV_TIERS,
  type BillingCycle,
  type BillingOverview,
  type EnterpriseCvTier,
  type Invoice,
} from "@/types";
import { CapacityMeter } from "./capacity-meter";

const STATUS_TONE = { paid: "match", open: "warning", failed: "danger" } as const;

function nearestTier(capacity: number | null): EnterpriseCvTier {
  return ENTERPRISE_CV_TIERS.find((tier) => tier === capacity) ?? ENTERPRISE_CV_TIERS[0];
}

function ChangePlanCard({ overview, onChanged }: { overview: BillingOverview; onChanged: () => void }) {
  const { t } = useLocale();
  const toast = useToast();
  const { user } = useSession();
  const { plan } = overview;
  const enterprise = plan.mode === "enterprise";
  const [tier, setTier] = useState(nearestTier(plan.cvCapacity));
  const [cycle, setCycle] = useState<BillingCycle>(plan.billingCycle);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const dirty = cycle !== plan.billingCycle || (enterprise && tier !== plan.cvCapacity);

  async function onSave() {
    setSaving(true);
    setFailed(false);
    try {
      await updatePlan(user.planMode, { tier: enterprise ? tier : null, cycle });
      track({ name: "plan_changed", cycle, tier: enterprise ? tier : null });
      toast.show(t("billing.change.done"), "match");
      onChanged();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{t("billing.change.title")}</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {enterprise ? t("billing.change.description") : t("billing.change.soloNote")}
        </p>
      </div>
      {enterprise && <TierSlider value={tier} onChange={setTier} />}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">{t("billing.change.cycle")}</span>
        <Segmented<BillingCycle>
          label={t("billing.change.cycle")}
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: t("plans.monthly") },
            { value: "yearly", label: t("plans.yearly") },
          ]}
        />
      </div>
      {failed && (
        <p role="alert" className="text-sm text-danger">
          {t("billing.change.error")}
        </p>
      )}
      <Button className="self-start" disabled={!dirty} loading={saving} onClick={onSave}>
        {saving ? t("billing.change.saving") : t("billing.change.save")}
      </Button>
    </Card>
  );
}

function BillingContent({ overview, onChanged }: { overview: BillingOverview; onChanged: () => void }) {
  const { t, locale } = useLocale();
  const { plan, currency } = overview;

  const columns: Column<Invoice>[] = [
    {
      id: "date",
      header: t("billing.invoices.col.date"),
      sortValue: (invoice) => invoice.issuedAt,
      cell: (invoice) => formatDate(locale, invoice.issuedAt),
    },
    {
      id: "amount",
      header: t("billing.invoices.col.amount"),
      cell: (invoice) =>
        invoice.amount === null || currency === null ? t("checkout.tbc") : formatPrice(invoice.amount, currency),
    },
    {
      id: "status",
      header: t("billing.invoices.col.status"),
      cell: (invoice) => (
        <Badge tone={STATUS_TONE[invoice.status]}>{t(`billing.invoices.status.${invoice.status}`)}</Badge>
      ),
    },
  ];

  return (
    <>
      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t("billing.plan.title")}</h2>
            <p className="mt-1 text-base text-text-primary">
              {t("billing.plan.name", { plan: t(plan.mode === "solo" ? "plans.solo" : "plans.enterprise") })}
            </p>
            <p className="text-sm text-text-secondary">
              {t("billing.plan.renews", { date: formatDate(locale, overview.renewsAt) })}
            </p>
          </div>
          <PriceDisplay
            perMonth={plan.pricePerMonth}
            currency={currency}
            cycle={plan.billingCycle}
            savingsPercent={plan.yearlyDiscountPercent}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-border-default pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-text-primary">{t("billing.usage.title")}</h3>
            <Badge>
              {plan.cvCapacity === null
                ? t("upload.capacity.unknown", { used: plan.cvUsed })
                : t("upload.capacity.used", { used: plan.cvUsed, capacity: plan.cvCapacity })}
            </Badge>
          </div>
          <CapacityMeter plan={plan} />
        </div>
      </Card>

      <ChangePlanCard key={`${plan.billingCycle}-${plan.cvCapacity}`} overview={overview} onChanged={onChanged} />

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">{t("billing.invoices.title")}</h2>
        {overview.invoices.length === 0 ? (
          <EmptyPanel icon="document" title={t("billing.invoices.empty")} />
        ) : (
          <DataTable
            columns={columns}
            rows={overview.invoices}
            getRowId={(invoice) => invoice.id}
            defaultSort={{ columnId: "date", direction: "desc" }}
          />
        )}
      </Card>
    </>
  );
}

export function BillingView() {
  const { t } = useLocale();
  const { user } = useSession();
  const load = useCallback(() => getBillingOverview(user.planMode), [user.planMode]);
  const { state, retry } = useAsync(load);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title={t("billing.title")} description={t("billing.subtitle")} />
      {user.role === "recruiter" ? (
        <EmptyPanel icon="lock" title={t("billing.adminOnly")} />
      ) : state.status === "loading" ? (
        <LoadingPanel label={t("common.loading")} />
      ) : state.status === "error" ? (
        <ErrorPanel message={t("billing.loadError")} onRetry={retry} />
      ) : (
        <BillingContent overview={state.data} onChanged={retry} />
      )}
    </div>
  );
}
