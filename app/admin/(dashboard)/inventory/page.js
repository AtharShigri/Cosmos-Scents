import { getInventoryData } from "@/lib/inventory";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const inventoryData = await getInventoryData("all");

  return (
    <div className="flex flex-col gap-6">
      <InventoryClient initialData={inventoryData} />
    </div>
  );
}
