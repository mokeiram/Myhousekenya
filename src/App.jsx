import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Plus, X, MapPin, Phone, Home, Loader2, Trash2 } from "lucide-react";
import { subscribeToListings, addListing, deleteListing } from "./firebase";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');`;

const COLORS = {
  bg: "#FAF7F0",
  ink: "#2D2A26",
  green: "#1B4332",
  sage: "#6B8F71",
  gold: "#C89B3C",
  brick: "#8B3A3A",
  line: "#E4DCC8",
  card: "#FFFFFF",
};

const SIZE_OPTIONS = [
  "Single room",
  "Bedsitter",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "4+ Bedroom",
  "Maisonette",
  "Bungalow",
];

function formatKES(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  return "KES " + n.toLocaleString("en-KE");
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

const SAMPLE_LISTINGS = [
  {
    location: "Kileleshwa, Nairobi",
    contact: "0712 345 678",
    size: "1 Bedroom",
    price: 25000,
    depositRequired: true,
    depositAmount: 25000,
    postedAt: Date.now() - 1000 * 60 * 60 * 5,
    isSample: true,
  },
  {
    location: "Nyali, Mombasa",
    contact: "0798 765 432",
    size: "Bedsitter",
    price: 9000,
    depositRequired: false,
    depositAmount: null,
    postedAt: Date.now() - 1000 * 60 * 60 * 26,
    isSample: true,
  },
  {
    location: "Milimani, Kisumu",
    contact: "0722 111 222",
    size: "2 Bedroom",
    price: 18000,
    depositRequired: true,
    depositAmount: 18000,
    postedAt: Date.now() - 1000 * 60 * 60 * 50,
    isSample: true,
  },
  {
    location: "Ruaka, Kiambu",
    contact: "0733 222 999",
    size: "Single room",
    price: 5000,
    depositRequired: false,
    depositAmount: null,
    postedAt: Date.now() - 1000 * 60 * 60 * 70,
    isSample: true,
  },
];

function DepositStamp({ required, amount }) {
  if (required) {
    return (
      <div className="absolute -top-2 -right-2 select-none" style={{ transform: "rotate(6deg)" }}>
        <div
          className="px-2.5 py-1 text-[10px] font-semibold tracking-wide"
          style={{
            background: COLORS.brick,
            color: "#FBEFE9",
            fontFamily: "'IBM Plex Mono', monospace",
            clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.18)",
          }}
        >
          DEPOSIT{amount ? ` · ${formatKES(amount)}` : ""}
        </div>
      </div>
    );
  }
  return (
    <div className="absolute -top-2 -right-2 select-none flex items-center justify-center" style={{ transform: "rotate(-8deg)" }}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-center"
        style={{
          border: `2px solid ${COLORS.green}`,
          color: COLORS.green,
          background: "rgba(255,255,255,0.9)",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9px",
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "0.03em",
          boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
        }}
      >
        NO
        <br />
        DEPOSIT
      </div>
    </div>
  );
}

function ListingCard({ listing, onDelete }) {
  return (
    <div
      className="relative rounded-md p-4 mb-4"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, boxShadow: "0 1px 2px rgba(43,40,34,0.05)" }}
    >
      <DepositStamp required={listing.depositRequired} amount={listing.depositAmount} />

      <div className="flex items-start justify-between pr-14">
        <h3 className="text-lg leading-snug" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: COLORS.ink }}>
          {listing.size}
        </h3>
        {listing.isSample && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: COLORS.bg, color: COLORS.sage, border: `1px solid ${COLORS.line}`, fontFamily: "'IBM Plex Sans', sans-serif" }}
          >
            Sample
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-1.5" style={{ color: COLORS.sage }}>
        <MapPin size={14} strokeWidth={2} />
        <span className="text-sm" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {listing.location}
        </span>
      </div>

      <div className="flex items-end justify-between mt-3">
        <div className="text-xl" style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: COLORS.green }}>
          {formatKES(listing.price)}
          <span className="text-xs ml-1" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            /month
          </span>
        </div>
        <span className="text-[11px]" style={{ color: COLORS.line, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {timeAgo(listing.postedAt)}
        </span>
      </div>

      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: `1px dashed ${COLORS.line}` }}>
        <div className="flex items-center gap-1.5" style={{ color: COLORS.ink }}>
          <Phone size={14} strokeWidth={2} style={{ color: COLORS.gold }} />
          <span className="text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {listing.contact}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${listing.contact.replace(/\s+/g, "")}`}
            className="text-xs px-3 py-1.5 rounded"
            style={{ background: COLORS.green, color: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }}
          >
            Call caretaker
          </a>
          <button onClick={() => onDelete(listing.id)} aria-label="Remove listing" className="p-1.5 rounded" style={{ border: `1px solid ${COLORS.line}` }}>
            <Trash2 size={14} color={COLORS.brick} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddListingModal({ onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    location: "",
    contact: "",
    size: SIZE_OPTIONS[2],
    price: "",
    depositRequired: "no",
    depositAmount: "",
  });
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.location.trim() || !form.contact.trim() || !form.price) {
      setError("Location, contact number and price are required.");
      return;
    }
    setError("");
    onSubmit({
      ...form,
      price: Number(form.price),
      depositRequired: form.depositRequired === "yes",
      depositAmount: form.depositRequired === "yes" ? Number(form.depositAmount) || null : null,
    });
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end sm:items-center justify-center" style={{ background: "rgba(27,67,50,0.35)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: COLORS.bg }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: COLORS.ink }} className="text-xl">
            Post a vacant house
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} color={COLORS.ink} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Location (estate / town)
            </label>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Ruaka, Kiambu"
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
              style={{ border: `1px solid ${COLORS.line}`, fontFamily: "'IBM Plex Sans', sans-serif" }}
            />
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Caretaker contact number
            </label>
            <input
              value={form.contact}
              onChange={(e) => update("contact", e.target.value)}
              placeholder="e.g. 0712 345 678"
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
              style={{ border: `1px solid ${COLORS.line}`, fontFamily: "'IBM Plex Mono', monospace" }}
            />
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              House size
            </label>
            <select
              value={form.size}
              onChange={(e) => update("size", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none bg-white"
              style={{ border: `1px solid ${COLORS.line}`, fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Monthly rent (KES)
            </label>
            <input
              value={form.price}
              onChange={(e) => update("price", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 12000"
              inputMode="numeric"
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
              style={{ border: `1px solid ${COLORS.line}`, fontFamily: "'IBM Plex Mono', monospace" }}
            />
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Is a deposit required?
            </label>
            <div className="flex gap-2 mt-1">
              {["no", "yes"].map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => update("depositRequired", v)}
                  className="flex-1 py-2 rounded text-sm font-medium"
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    background: form.depositRequired === v ? COLORS.green : "white",
                    color: form.depositRequired === v ? COLORS.bg : COLORS.ink,
                    border: `1px solid ${form.depositRequired === v ? COLORS.green : COLORS.line}`,
                  }}
                >
                  {v === "no" ? "No deposit" : "Deposit required"}
                </button>
              ))}
            </div>
          </div>

          {form.depositRequired === "yes" && (
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                Deposit amount (KES, optional)
              </label>
              <input
                value={form.depositAmount}
                onChange={(e) => update("depositAmount", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 12000"
                inputMode="numeric"
                className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
                style={{ border: `1px solid ${COLORS.line}`, fontFamily: "'IBM Plex Mono', monospace" }}
              />
            </div>
          )}

          {error && (
            <p className="text-xs" style={{ color: COLORS.brick, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded text-sm font-semibold mt-2 flex items-center justify-center gap-2"
            style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'IBM Plex Sans', sans-serif" }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Posting..." : "Post listing"}
          </button>
          <p className="text-[11px] text-center" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            Visible to everyone who opens this app.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState("");
  const seeded = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToListings((items) => {
      setListings(items);
      setLoading(false);

      if (items.length === 0 && !seeded.current) {
        seeded.current = true;
        SAMPLE_LISTINGS.forEach((sample) => {
          addListing(sample).catch(() => {});
        });
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleAdd(data) {
    setSaving(true);
    try {
      await addListing({ ...data, postedAt: Date.now() });
      setShowModal(false);
    } catch (e) {
      setLoadError("Couldn't save your listing. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteListing(id);
    } catch (e) {
      setLoadError("Couldn't remove that listing. Please try again.");
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return listings;
    const q = query.trim().toLowerCase();
    return listings.filter((l) => l.location.toLowerCase().includes(q) || l.size.toLowerCase().includes(q));
  }, [listings, query]);

  return (
    <div className="min-h-screen w-full" style={{ background: COLORS.bg }}>
      <style>{FONT_IMPORT}</style>

      <header className="sticky top-0 z-10 px-4 pt-5 pb-4" style={{ background: COLORS.green }}>
        <div className="flex items-center gap-2">
          <Home size={22} color={COLORS.gold} strokeWidth={2.2} />
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: COLORS.bg }} className="text-2xl">
            My House Kenya
          </h1>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#CFE0D2", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Vacant houses across Kenya, posted by caretakers
        </p>

        <div className="relative mt-3">
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.sage }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by location or house size"
            className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", border: "none" }}
          />
        </div>
      </header>

      <main className="px-4 pt-4 pb-24 max-w-md mx-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="animate-spin" size={22} color={COLORS.sage} />
            <p className="text-sm" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Loading listings...
            </p>
          </div>
        )}

        {!loading && loadError && (
          <p className="text-sm text-center py-8" style={{ color: COLORS.brick, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {loadError}
          </p>
        )}

        {!loading && !loadError && filtered.length === 0 && (
          <div className="text-center py-16">
            <p style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }} className="text-lg mb-1">
              {listings.length === 0 ? "No houses posted yet" : "No matches"}
            </p>
            <p className="text-sm" style={{ color: COLORS.sage, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {listings.length === 0 ? "Be the first caretaker to post a vacant house." : "Try a different location or house size."}
            </p>
          </div>
        )}

        {!loading && filtered.map((listing) => <ListingCard key={listing.id} listing={listing} onDelete={handleDelete} />)}
      </main>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-10"
        style={{ background: COLORS.gold, boxShadow: "0 4px 12px rgba(43,40,34,0.25)" }}
        aria-label="Post a vacant house"
      >
        <Plus size={26} color={COLORS.ink} strokeWidth={2.5} />
      </button>

      {showModal && <AddListingModal onClose={() => setShowModal(false)} onSubmit={handleAdd} saving={saving} />}
    </div>
  );
}
