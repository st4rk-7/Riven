
const params = new URLSearchParams(window.location.search);

if (params.get("view") === "observation-demo") {
  // Preserve the existing RIV-3 page and its real API request.
  void import("./main");
} else {
  // Start the new RIV-16 interface.
  void import("./riven-main");
}
