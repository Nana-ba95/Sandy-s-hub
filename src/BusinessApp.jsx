import { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  ClipboardList,
  LayoutGrid,
  Plus,
  Minus,
  Trash2,
  Check,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { supabase } from "./supabaseClient.js";

const SALES_TREND = [
  { day: "Mon", sales: 120 },
  { day: "Tue", sales: 180 },
  { day: "Wed", sales: 140 },
  { day: "Thu", sales: 220 },
  { day: "Fri", sales: 260 },
  { day: "Sat", sales: 310 },
  { day: "Sun", sales: 190 },
];

const KIND_TONE = {
  Physical: "#3B6E8F",
  Digital: "#C9A15A",
  Service: "#B8873F",
};

function TallyTab({ active, label, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-3 text-sm tracking-wide transition-colors ${
        active ? "text-[#F5F0E6]" : "text-[#1F2E45]/60 hover:text-[#1F2E45]"
      }`}
      style={{ fontFamily: "'Fraunces', Georgia, serif" }}
    >
      <Icon size={16} strokeWidth={2} />
      {label}
      {active && (
        <span
          className="absolute inset-0 -z-10 rounded-t-md"
          style={{ background: "#1F2E45" }}
        />
      )}
    </button>
  );
}

function Ledger({ title, right, children }) {
  return (
    <div className="rounded-lg border border-[#1F2E45]/15 bg-[#FAFAFA] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1F2E45]/10 px-5 py-3">
        <h3
          className="text-sm uppercase tracking-[0.12em] text-[#1F2E45]/70"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {title}
        </h3>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}const PAYSTACK_PUBLIC_KEY = "pk_test_f87abe4830a39b5d01ef53de326acc988fb3b0cf";

function CustomerView({ products, cart, setCart, refreshProducts, refreshOrders }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (document.getElementById("paystack-inline-script")) return;
    const script = document.createElement("script");
    script.id = "paystack-inline-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const addToCart = (product) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === product.id);
      if (existing) {
        return c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  const finalizeOrder = async () => {
    const itemsSummary = cart.map((i) => `${i.name} x${i.qty}`).join(", ");
    await supabase.from("orders").insert({
      customer: customerName.trim() || "Guest",
      items: itemsSummary,
      total,
      status: "Pending",
    });

    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;
      await supabase
        .from("products")
        .update({
          stock: product.stock !== null ? Math.max(0, product.stock - item.qty) : null,
          sold: product.sold + item.qty,
        })
        .eq("id", product.id);
    }

    await refreshProducts();
    await refreshOrders();

    setPlaced(true);
    setCart([]);
    setCustomerName("");
    setCustomerEmail("");
    setPaying(false);
    setTimeout(() => setPlaced(false), 2500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 rounded-lg border border-[#1F2E45]/15 bg-[#1F2E45] px-6 py-8 text-[#F5F0E6]">
          <p
            className="text-xs uppercase tracking-[0.2em] text-[#F5F0E6]/60"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Open for business
          </p>
          <h2 className="mt-2 text-3xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            The Shelf
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[#F5F0E6]/70">
            Goods, downloads, and time — all sold from one counter.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-lg border border-[#1F2E45]/15 bg-[#FAFAFA] p-4"
            >
              <div>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="mb-3 h-32 w-full rounded-md object-cover" />
                ) : (
                  <div className="mb-3 flex h-32 w-full items-center justify-center rounded-md bg-[#1F2E45]/5 text-xs text-[#1F2E45]/30">
                    No photo yet
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <h4 className="text-base text-[#1F2E45]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                    {p.name}
                  </h4>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#FAFAFA]"
                    style={{ background: KIND_TONE[p.kind] }}
                  >
                    {p.kind}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-1 text-xs leading-relaxed text-[#1F2E45]/60">{p.description}</p>
                )}
                <p className="mt-2 text-lg text-[#1F2E45]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  ${p.price}
                </p>
                {p.stock !== null && <p className="text-xs text-[#1F2E45]/50">{p.stock} in stock</p>}
              </div>
              <button
                onClick={() => addToCart(p)}
                className="mt-4 rounded-md bg-[#1F2E45] py-2 text-sm text-[#F5F0E6] transition-opacity hover:opacity-90"
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <Ledger title="Your cart">
        {placed && (
          <p className="mb-3 rounded-md bg-[#3F7D5C]/10 px-3 py-2 text-center text-sm text-[#3F7D5C]">
            Order placed — thank you!
          </p>
        )}
        {cart.length === 0 ? (
          <p className="text-sm text-[#1F2E45]/50">Nothing here yet — add something from the shelf.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              placeholder="Your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded border border-[#1F2E45]/20 bg-transparent px-2 py-1 text-sm"
            />
            <input
              placeholder="Your email (for payment receipt)"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="rounded border border-[#1F2E45]/20 bg-transparent px-2 py-1 text-sm"
            />
            {cart.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-[#1F2E45]">{i.name}</p>
                  <p className="text-[#1F2E45]/50">${i.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(i.id, -1)} className="rounded border border-[#1F2E45]/20 p-1">
                    <Minus size={12} />
                  </button>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{i.qty}</span>
                  <button onClick={() => changeQty(i.id, 1)} className="rounded border border-[#1F2E45]/20 p-1">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-[#1F2E45]/10 pt-3 text-sm">
              <span className="text-[#1F2E45]/70">Total</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>${total}</span>
            </div>
            {payError && <p className="text-center text-xs text-[#B8873F]">{payError}</p>}
            <button
              disabled={paying || !customerEmail}
              onClick={() => {
                setPayError("");
                if (!window.PaystackPop) {
                  setPayError("Payment window couldn't load — check your connection and try again.");
                  return;
                }
                setPaying(true);
                const handler = window.PaystackPop.setup({
                  key: PAYSTACK_PUBLIC_KEY,
                  email: customerEmail,
                  amount: Math.round(total * 100),
                  currency: "GHS",
                  ref: `sh_${Date.now()}`,
                  callback: () => finalizeOrder(),
                  onClose: () => setPaying(false),
                });
                handler.openIframe();
              }}
              className="mt-2 rounded-md bg-[#B8873F] py-2 text-sm text-[#F5F0E6] hover:opacity-90 disabled:opacity-40"
            >
              {paying ? "Processing…" : `Pay $${total} & place order`}
            </button>
            {!customerEmail && (
              <p className="text-center text-[10px] text-[#1F2E45]/40">Enter your email to enable payment</p>
            )}
          </div>
        )}
      </Ledger>
    </div>
  );
}

function EmployeeView({ orders, products, refreshOrders, refreshProducts }) {
  const fulfill = async (id) => {
    await supabase.from("orders").update({ status: "Fulfilled" }).eq("id", id);
    await refreshOrders();
  };

  const adjustStock = async (product, delta) => {
    if (product.stock === null) return;
    const newStock = Math.max(0, product.stock + delta);
    await supabase.from("products").update({ stock: newStock }).eq("id", product.id);
    await refreshProducts();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Ledger title="Order queue">
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-md border border-[#1F2E45]/10 px-3 py-2 text-sm"
            >
              <div>
                <p className="text-[#1F2E45]">{o.customer}</p>
                <p className="text-[#1F2E45]/50">{o.items}</p>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>${o.total}</span>
                {o.status === "Fulfilled" ? (
                  <span className="flex items-center gap-1 text-xs text-[#3F7D5C]">
                    <Check size={14} /> Fulfilled
                  </span>
                ) : (
                  <button
                    onClick={() => fulfill(o.id)}
                    className="rounded-md bg-[#1F2E45] px-3 py-1 text-xs text-[#F5F0E6]"
                  >
                    Mark fulfilled
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Ledger>

      <Ledger title="Stock on hand">
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className="text-[#1F2E45]">{p.name}</span>
              {p.stock === null ? (
                <span className="text-xs text-[#1F2E45]/40">unlimited</span>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustStock(p, -1)} className="rounded border border-[#1F2E45]/20 p-1">
                    <Minus size={12} />
                  </button>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="w-6 text-center">
                    {p.stock}
                  </span>
                  <button onClick={() => adjustStock(p, 1)} className="rounded border border-[#1F2E45]/20 p-1">
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Ledger>
    </div>
  );
}function AdminView({ products, orders, refreshProducts }) {
  const [draft, setDraft] = useState({
    name: "",
    kind: "Physical",
    price: "",
    stock: "",
    image: "",
    description: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const revenue = products.reduce((sum, p) => sum + p.sold * p.price, 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];if (!file) {
      setUploadError("No file detected by browser.");
      return;
    }
    setUploadError(`File detected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    setUploading(true);
    setUploadError("");
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      setUploadErrorsetUploadError(`Upload failed: ${error.message} | file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setDraft((d) => ({ ...d, image: data.publicUrl }));
    setUploading(false);
  };

  const addProduct = async () => {
    if (!draft.name || !draft.price) return;
    await supabase.from("products").insert({
      name: draft.name,
      kind: draft.kind,
      price: Number(draft.price),
      stock: draft.kind === "Digital" ? null : Number(draft.stock || 0),
      sold: 0,
      image: draft.image,
      description: draft.description,
    });
    setDraft({ name: "", kind: "Physical", price: "", stock: "", image: "", description: "" });
    await refreshProducts();
  };

  const removeProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    await refreshProducts();
  };

  const byKind = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.kind] = (map[p.kind] || 0) + p.sold * p.price;
    });
    return Object.entries(map).map(([kind, value]) => ({ kind, value }));
  }, [products]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#1F2E45]/15 bg-[#FAFAFA] p-4">
          <div className="flex items-center gap-2 text-[#1F2E45]/50">
            <TrendingUp size={14} />
            <span className="text-xs uppercase tracking-wide">Revenue to date</span>
          </div>
          <p className="mt-2 text-2xl text-[#1F2E45]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ${revenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-[#1F2E45]/15 bg-[#FAFAFA] p-4">
          <div className="flex items-center gap-2 text-[#1F2E45]/50">
            <ClipboardList size={14} />
            <span className="text-xs uppercase tracking-wide">Pending orders</span>
          </div>
          <p className="mt-2 text-2xl text-[#1F2E45]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {pendingCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#1F2E45]/15 bg-[#FAFAFA] p-4">
          <div className="flex items-center gap-2 text-[#1F2E45]/50">
            <Package size={14} />
            <span className="text-xs uppercase tracking-wide">Products listed</span>
          </div>
          <p className="mt-2 text-2xl text-[#1F2E45]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {products.length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Ledger title="Sales this week">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={SALES_TREND}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#1F2E4599" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1F2E45", border: "none", borderRadius: 6 }}
                labelStyle={{ color: "#F5F0E6" }}
                itemStyle={{ color: "#F5F0E6" }}
              />
              <Line type="monotone" dataKey="sales" stroke="#B8873F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Ledger>

        <Ledger title="Revenue by category">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byKind}>
              <XAxis dataKey="kind" tick={{ fontSize: 11, fill: "#1F2E4599" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1F2E45", border: "none", borderRadius: 6 }}
                labelStyle={{ color: "#F5F0E6" }}
                itemStyle={{ color: "#F5F0E6" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byKind.map((entry, idx) => (
                  <Cell key={idx} fill={KIND_TONE[entry.kind] || "#1F2E45"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Ledger>
      </div>

      <Ledger title="Manage catalog">
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-8 w-8 rounded object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded bg-[#1F2E45]/5" />
                )}
                <div>
                  <span className="text-[#1F2E45]">{p.name}</span>
                  <span className="ml-2 text-xs text-[#1F2E45]/40">{p.kind}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>${p.price}</span>
                <button onClick={() => removeProduct(p.id)} className="text-[#1F2E45]/40 hover:text-[#B8873F]">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="mt-3 flex flex-col gap-2 border-t border-[#1F2E45]/10 pt-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <input
                placeholder="Name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="col-span-2 rounded border border-[#1F2E45]/20 bg-transparent px-2 py-1 text-sm sm:col-span-1"
              />
              <select
                value={draft.kind}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
                className="rounded border border-[#1F2E45]/20 bg-[#FAFAFA] px-2 py-1 text-sm"
              >
                <option>Physical</option>
                <option>Digital</option>
                <option>Service</option>
              </select>
              <input
                placeholder="Price"
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                className="rounded border border-[#1F2E45]/20 bg-transparent px-2 py-1 text-sm"
              />
              <input
                placeholder="Stock"
                type="number"
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                disabled={draft.kind === "Digital"}
                className="rounded border border-[#1F2E45]/20 bg-transparent px-2 py-1 text-sm disabled:opacity-30"
              />
              <button
                onClick={addProduct}
                className="flex items-center justify-center gap-1 rounded bg-[#1F2E45] px-2 py-1 text-sm text-[#F5F0E6]"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="flex items-center justify-center gap-2 rounded border border-dashed border-[#1F2E45]/30 px-2 py-2 text-sm text-[#1F2E45]/60">
                  {uploading ? "Uploading…" : draft.image ? "Photo selected ✓" : "Choose photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {uploadError && <p className="text-xs text-[#B8873F]">{uploadError}</p>}
              </div>
              <input
                placeholder="Short description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="rounded border border-[#1F2E45]/20 bg-transparent px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      </Ledger>
    </div>
  );
}

export default function BusinessApp() {
  const [role, setRole] = useState("customer");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  const refreshProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id");
    setProducts(data || []);
  };

  const refreshOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => {
    (async () => {
      await refreshProducts();
      await refreshOrders();
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] pb-16" style={{ fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      <header className="border-b border-[#1F2E45]/15 bg-[#FFFFFF] px-6 pt-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/PHOTO-2026-05-24-21-23-10.jpg"
              alt="Sandy's Hub logo"
              className="h-9 w-9 rounded object-cover"
            />
            <span className="text-xl text-[#1F2E45]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Sandy's Hub
            </span>
          </div>
          <span className="hidden text-xs text-[#1F2E45]/40 sm:block">
            one counter — three sides of the business
          </span>
        </div>
        <nav className="mx-auto mt-6 flex max-w-5xl gap-1">
          <TallyTab active={role === "customer"} label="Customer" icon={ShoppingBag} onClick={() => setRole("customer")} />
          <TallyTab active={role === "employee"} label="Employee" icon={ClipboardList} onClick={() => setRole("employee")} />
          <TallyTab active={role === "employer"} label="Employer" icon={LayoutGrid} onClick={() => setRole("employer")} />
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-8">
        {loading ? (
          <p className="text-center text-sm text-[#1F2E45]/50">Loading Sandy's Hub…</p>
        ) : (
          <>
            {role === "customer" && (
              <CustomerView
                products={products}
                cart={cart}
                setCart={setCart}
                refreshProducts={refreshProducts}
                refreshOrders={refreshOrders}
              />
            )}
            {role === "employee" && (
              <EmployeeView
                orders={orders}
                products={products}
                refreshOrders={refreshOrders}
                refreshProducts={refreshProducts}
              />
            )}
            {role === "employer" && (
              <AdminView products={products} orders={orders} refreshProducts={refreshProducts} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
