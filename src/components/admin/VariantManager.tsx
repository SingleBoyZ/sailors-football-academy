"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatSenCompact, parseRinggitToSen } from "@/lib/money";
import { addVariant, updateVariant, deleteVariant } from "@/app/admin/products/actions";

type Variant = { id: string; label: string; sku: string; stock: number; priceOverrideSen: number | null };

function VariantRow({ variant }: { variant: Variant }) {
  const router = useRouter();
  const [stock, setStock] = useState(variant.stock);
  const [saving, setSaving] = useState(false);

  async function handleStockBlur() {
    if (stock === variant.stock) return;
    setSaving(true);
    await updateVariant(variant.id, { label: variant.label, sku: variant.sku, stock, priceOverrideSen: variant.priceOverrideSen });
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    await deleteVariant(variant.id);
    router.refresh();
  }

  return (
    <tr className="border-b border-brand-ink/5">
      <td className="py-2">{variant.label}</td>
      <td className="py-2 font-mono text-xs">{variant.sku}</td>
      <td className="py-2">
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={handleStockBlur}
          disabled={saving}
          className="w-20 border border-brand-ink/15 px-2 py-1"
        />
      </td>
      <td className="py-2">{variant.priceOverrideSen ? formatSenCompact(variant.priceOverrideSen) : "—"}</td>
      <td className="py-2">
        <button onClick={handleDelete} className="text-brand-muted hover:text-brand-red" aria-label="Delete variant">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export function VariantManager({ productId, variants }: { productId: string; variants: Variant[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("0");
  const [priceOverride, setPriceOverride] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setError(null);
    if (!label.trim() || !sku.trim()) {
      setError("Label and SKU are required.");
      return;
    }
    setAdding(true);
    const result = await addVariant(productId, {
      label: label.trim(),
      sku: sku.trim(),
      stock: Number(stock) || 0,
      priceOverrideSen: priceOverride ? parseRinggitToSen(priceOverride) : null,
    });
    setAdding(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLabel("");
    setSku("");
    setStock("0");
    setPriceOverride("");
    router.refresh();
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-brand-muted border-b border-brand-ink/10 text-left">
            <th className="py-2 font-normal">Label</th>
            <th className="py-2 font-normal">SKU</th>
            <th className="py-2 font-normal">Stock</th>
            <th className="py-2 font-normal">Price Override</th>
            <th className="py-2 font-normal" />
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <VariantRow key={v.id} variant={v} />
          ))}
        </tbody>
      </table>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <input placeholder="Label (e.g. Size M)" value={label} onChange={(e) => setLabel(e.target.value)} className="border border-brand-ink/15 px-2 py-1.5 text-sm" />
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="border border-brand-ink/15 px-2 py-1.5 text-sm" />
        <input placeholder="Stock" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="border border-brand-ink/15 px-2 py-1.5 text-sm" />
        <input placeholder="Price override (RM, optional)" value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} className="border border-brand-ink/15 px-2 py-1.5 text-sm" />
        <button onClick={handleAdd} disabled={adding} className="bg-brand-ink text-brand-white px-2 py-1.5 text-sm">
          {adding ? "Adding…" : "Add Variant"}
        </button>
      </div>
      {error && <p className="text-brand-red-dark mt-2 text-xs">{error}</p>}
    </div>
  );
}
