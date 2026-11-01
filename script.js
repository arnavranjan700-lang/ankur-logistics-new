
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const trackForm = document.getElementById("trackForm");
const trackInput = document.getElementById("trackingId");
const result = document.getElementById("trackingResult");

async function track(id) {
  const key = (id || "").trim().toUpperCase();

  if (!key) {
    result.textContent = "Please enter your tracking number.";
    return;
  }

  result.textContent = "Searching shipment...";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/track_shipment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ p_tracking_number: key })
      }
    );

    if (!response.ok) {
      throw new Error("Tracking service is not available.");
    }

    const rows = await response.json();
    const s = rows[0];

    if (!s) {
      result.textContent =
        "Tracking ID not found. Please check your tracking number.";
      return;
    }

    const status = s.status;
    const stages = ["Shipment", "Pickup", "Transit", "Delivered"];

    let step = 0;
    if (status === "Picked Up") step = 1;
    if (status === "In Transit" || status === "Out for Delivery") step = 2;
    if (status === "Delivered") step = 3;

    result.replaceChildren();

    const line = document.createElement("div");
    line.className = "status-line";

    const tracking = document.createElement("strong");
    tracking.textContent = `Tracking ID: ${s.tracking_number}`;

    const pill = document.createElement("span");
    pill.className = "status-pill";
    pill.textContent = status;

    line.append(tracking, pill);

    const route = document.createElement("div");
    route.className = "status-route";
    route.textContent = `${s.sender_city || "—"} → ${s.receiver_city || "—"}`;

    const timeline = document.createElement("div");
    timeline.className = "timeline";

    stages.forEach((stage, index) => {
      const item = document.createElement("span");
      item.textContent = stage;

      if (index <= step && status !== "Cancelled") {
        item.className = "done";
      }

      timeline.appendChild(item);
    });

    result.append(line, route, timeline);

    if (status === "Cancelled") {
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = "This shipment has been cancelled.";
      result.appendChild(note);
    }
  } catch (error) {
    result.textContent =
      "Unable to track shipment right now. Please try again later.";
    console.error(error);
  }
}

trackForm.addEventListener("submit", event => {
  event.preventDefault();
  track(trackInput.value);
});

document.querySelectorAll("[data-track]").forEach(button => {
  button.addEventListener("click", () => {
    trackInput.value = button.dataset.track;
    track(button.dataset.track);
  });
});

const rates = {
  parcel: { rate: 20, min: 500, label: "Parcel minimum charge" },
  ptl: { rate: 15, min: 1007, label: "PTL minimum charge" },
  ftl: { rate: 25, min: 6500, label: "FTL minimum charge" }
};

function calculate() {
  const type = document.getElementById("shipmentType").value;
  const weight = Math.max(
    1, Number(document.getElementById("weight").value) || 1
  );
  const handling = document.getElementById("handling").value;
  const r = rates[type];

  if (!r) return;

  const base = Math.max(r.min, weight * r.rate);
  const total = base + (handling === "special" ? 775 : 0);

  document.getElementById("estimateAmount").textContent =
    total.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    });

  document.getElementById("estimateNote").textContent =
    handling === "special"
      ? `${r.label} + ₹775 special handling`
      : r.label;
}

document.getElementById("calcForm").addEventListener("submit", event => {
  event.preventDefault();
  calculate();
});

["shipmentType", "weight", "handling"].forEach(id => {
  document.getElementById(id).addEventListener("change", calculate);
});

document.getElementById("year").textContent = new Date().getFullYear();
