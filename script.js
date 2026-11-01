
const demoShipments = {
  "AL123456": {
    status: "Transit",
    pickup: "Delhi",
    delivery: "Jaipur",
    step: 2,
    events: ["Shipment", "Pickup", "Transit", "Delivered"]
  },
  "AL100200": {
    status: "Shipment",
    pickup: "Mumbai",
    delivery: "Delhi",
    step: 0,
    events: ["Shipment", "Pickup", "Transit", "Delivered"]
  },
  "AL555777": {
    status: "Delivered",
    pickup: "Pune",
    delivery: "Lucknow",
    step: 3,
    events: ["Shipment", "Pickup", "Transit", "Delivered"]
  }
};

const trackForm = document.getElementById("trackForm");
const trackInput = document.getElementById("trackingId");
const result = document.getElementById("trackingResult");

function track(id) {
  const key = (id || "").trim().toUpperCase();
  const s = demoShipments[key];

  if (!s) {
    result.innerHTML =
      '<p class="muted">Tracking ID not found. Please check your ID.</p>';
    return;
  }

  result.innerHTML = `
    <div class="status-line">
      <strong>Tracking ID: ${key}</strong>
      <span class="status-pill">${s.status}</span>
    </div>
    <div class="status-route">
      ${s.pickup} <span style="color:#075be8">→</span> ${s.delivery}
    </div>
    <div class="timeline">
      ${s.events.map((e, i) =>
        `<span class="${i <= s.step ? "done" : ""}">${e}</span>`
      ).join("")}
    </div>
    <p class="muted">Demo tracking only. Actual shipment status is not connected.</p>
  `;
}

trackForm.addEventListener("submit", e => {
  e.preventDefault();
  track(trackInput.value);
});

document.querySelectorAll("[data-track]").forEach(b => {
  b.addEventListener("click", () => {
    trackInput.value = b.dataset.track;
    track(b.dataset.track);
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

document.getElementById("calcForm").addEventListener("submit", e => {
  e.preventDefault();
  calculate();
});

["shipmentType", "weight", "handling"].forEach(id => {
  document.getElementById(id).addEventListener("change", calculate);
});

document.getElementById("year").textContent = new Date().getFullYear();
