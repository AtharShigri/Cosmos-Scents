import { getFinanceData } from "@/lib/finance";
import FinanceClient from "./FinanceClient";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const financeData = await getFinanceData();

  return (
    <div className="flex flex-col gap-6">
      <FinanceClient initialData={financeData} />
    </div>
  );
}
