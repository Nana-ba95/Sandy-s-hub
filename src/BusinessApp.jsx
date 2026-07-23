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
  X,
  TrendingUp,
  Users,
  BarChart3,
  Store,
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

// ---------- seed data ----------

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "Cedar Candle",
    kind: "Physical",
    price: 18,
    stock: 24,
    sold: 61,
    image: "",
    description: "Hand-poured soy candle with a warm cedar and amber scent.",
  },
  {
    id: "p2",
    name: "Studio Notebook",
    kind: "Physical",
    price: 12,
    stock: 40,
    sold: 88,
    image: "",
    description: "A5 dotted notebook, 120 pages, stitched binding.",
  },
  {
    id: "p3",
    name: "Brand Kit Template",
    kind: "Digital",
    price: 29,
    stock: null,
    sold: 34,
    image: "",
    description: "Editable logo, color palette, and social templates — instant download.",
  },
  {
    id: "p4",
    name: "1:1 Consulting Hour",
    kind: "Service",
    price: 85,
    stock: 6,
    sold: 19,
    image: "",
    description: "One hour of one-on-one shipping and logistics guidance.",
  },
  {
    id: "p5",
    name: "Ceramic Mug",
    kind: "Physical",
    price: 22,
    stock: 15,
    sold: 42,
    image: "",
    description: "Stoneware mug, dishwasher safe, holds 12oz.",
  },
];

const INITIAL_ORDERS = [
  { id: "o1", customer: "R. Alvarez", items: "Cedar Candle x2", total: 36, status: "Pending" },
  { id: "o2", customer: "J. Kim", items: "Brand Kit Template", total: 29, status: "Fulfilled" },
  { id: "o3", customer: "T. Nguyen", items: "Ceramic Mug x3", total: 66, status: "Pending" },
];

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

// ---------- shared bits ----------

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
}

// ---------- Customer view ----------

// Replace with your real Paystack public key from your Paystack dashboard.
// This one is a placeholder and will not process real payments.
const PAYSTACK_PUBLIC_KEY = "pk_test_f87abe4830a39b5d01ef53de326acc988fb3b0cf";

function CustomerView({ products, cart, setCart, setOrders, setProducts }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

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
  const [placed, setPlaced] = useState(false);

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
          <h2
            className="mt-2 text-3xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
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
                  <img
                    src={p.image}
                    alt={p.name}
                    className="mb-3 h-32 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-32 w-full items-center justify-center rounded-md bg-[#1F2E45]/5 text-xs text-[#1F2E45]/30">
                    No photo yet
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <h4
                    className="text-base text-[#1F2E45]"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
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
                  <p className="mt-1 text-xs leading-relaxed text-[#1F2E45]/60">
                    {p.description}
                  </p>
                )}
                <p
                  className="mt-2 text-lg text-[#1F2E45]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ${p.price}
                </p>
                {p.stock !== null && (
                  <p className="text-xs text-[#1F2E45]/50">{p.stock} in stock</p>
                )}
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
            {payError && (
              <p className="text-center text-xs text-[#B8873F]">{payError}</p>
            )}
            <button
              disabled={paying || !customerEmail}
              onClick={() => {
                setPayError("");

                const finalizeOrder = () => {
                  const itemsSummary = cart.map((i) => `${i.name} x${i.qty}`).join(", ");
                  const newOrder = {
                    id: `o${Date.now()}`,
                    customer: customerName.trim() || "Guest",
                    items: itemsSummary,
                    total,
                    status: "Pending",
                  };
                  setOrders((os) => [newOrder, ...os]);
                  setProducts((ps) =>
                    ps.map((p) => {
                      const inCart = cart.find((i) => i.id === p.id);
                      if (!inCart) return p;
                      return {
                        ...p,
                        stock: p.stock !== null ? Math.max(0, p.stock - inCart.qty) : null,
                        sold: p.sold + inCart.qty,
                      };
                    })
                  );
                  setPlaced(true);
                  setCart([]);
                  setCustomerName("");
                  setCustomerEmail("");
                  setPaying(false);
                  setTimeout(() => setPlaced(false), 2500);
                };

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
              <p className="text-center text-[10px] text-[#1F2E45]/40">
                Enter your email to enable payment
              </p>
            )}
          </div>
        )}
      </Ledger>
    </div>
  );
}

function EmployeeView({ orders, setOrders, products, setProducts }) {
  const fulfill = (id) => {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: "Fulfilled" } : o)));
  };

  const adjustStock = (id, delta) => {
    setProducts((ps) =>
      ps.map((p) => (p.id === id && p.stock !== null ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
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
                  <button onClick={() => adjustStock(p.id, -1)} className="rounded border border-[#1F2E45]/20 p-1">
                    <Minus size={12} />
                  </button>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="w-6 text-center">
                    {p.stock}
                  </span>
                  <button onClick={() => adjustStock(p.id, 1)} className="rounded border border-[#1F2E45]/20 p-1">
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
}

function AdminView({ products, setProducts, orders }) {
  const [draft, setDraft] = useState({
    name: "",
    kind: "Physical",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const revenue = products.reduce((sum, p) => sum + p.sold * p.price, 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  const addProduct = () => {
    if (!draft.name || !draft.price) return;
    setProducts((ps) => [
      ...ps,
      {
        id: `p${ps.length + 1}${Date.now()}`,
        name: draft.name,
        kind: draft.kind,
        price: Number(draft.price),
        stock: draft.kind === "Digital" ? null : Number(draft.stock || 0),
        sold: 0,
        image: draft.image,
        description: draft.description,
      },
    ]);
    setDraft({ name: "", kind: "Physical", price: "", stock: "", image: "", description: "" });
  };

  const removeProduct = (id) => setProducts((ps) => ps.filter((p) => p.id !== id));

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
              <input
                placeholder="Photo URL (optional)"
                value={draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                className="rounded border border-[#1F2E45]/20 bg-transparent px-2 py-1 text-sm"
              />
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
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [cart, setCart] = useState([]);

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
            <span
              className="text-xl text-[#1F2E45]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Sandy's Hub
            </span>
          </div>
          <span className="hidden text-xs text-[#1F2E45]/40 sm:block">
            one counter — three sides of the business
          </span>
        </div>
        <nav className="mx-auto mt-6 flex max-w-5xl gap-1">
          <TallyTab
            active={role === "customer"}
            label="Customer"
            icon={ShoppingBag}
            onClick={() => setRole("customer")}
          />
          <TallyTab
            active={role === "employee"}
            label="Employee"
            icon={ClipboardList}
            onClick={() => setRole("employee")}
          />
          <TallyTab
            active={role === "employer"}
            label="Employer"
            icon={LayoutGrid}
            onClick={() => setRole("employer")}
          />
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-8">
        {role === "customer" && (
          <CustomerView
            products={products}
            cart={cart}
            setCart={setCart}
            setOrders={setOrders}
            setProducts={setProducts}
          />
        )}
        {role === "employee" && (
          <EmployeeView orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} />
        )}
        {role === "employer" && (
          <AdminView products={products} setProducts={setProducts} orders={orders} />
        )}
      </main>
    </div>
  );
}
