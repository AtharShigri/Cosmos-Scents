import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function getInventoryData(filterStatus = "all") {
  await dbConnect();

  const products = await Product.find()
    .sort({ stock: 1, name: 1 })
    .populate("category")
    .lean();

  const formatted = products.map((p) => {
    let health = "healthy";
    if (p.stock === 0) health = "out_of_stock";
    else if (p.stock <= 5) health = "critical";
    else if (p.stock <= 10) health = "low";

    const parLevel = 25; // Target par stock for artisanal batching
    const reorderNeeded = Math.max(0, parLevel - p.stock);
    const valuation = (p.stock || 0) * (p.price || 0);

    return {
      _id: String(p._id),
      name: p.name,
      slug: p.slug,
      stock: p.stock,
      price: p.price,
      size: p.size || "50ml",
      categoryName: p.category?.name || "General",
      active: p.active,
      health,
      parLevel,
      reorderNeeded,
      valuation,
    };
  });

  const totalSKUs = formatted.length;
  const totalUnits = formatted.reduce((sum, p) => sum + p.stock, 0);
  const totalValuation = formatted.reduce((sum, p) => sum + p.valuation, 0);
  const outOfStockCount = formatted.filter((p) => p.health === "out_of_stock").length;
  const lowStockCount = formatted.filter((p) => p.health === "critical" || p.health === "low").length;
  const healthyCount = formatted.filter((p) => p.health === "healthy").length;

  let filtered = formatted;
  if (filterStatus === "low") {
    filtered = formatted.filter((p) => p.health === "low" || p.health === "critical");
  } else if (filterStatus === "out") {
    filtered = formatted.filter((p) => p.health === "out_of_stock");
  } else if (filterStatus === "healthy") {
    filtered = formatted.filter((p) => p.health === "healthy");
  }

  return {
    products: filtered,
    metrics: {
      totalSKUs,
      totalUnits,
      totalValuation,
      outOfStockCount,
      lowStockCount,
      healthyCount,
    },
  };
}

