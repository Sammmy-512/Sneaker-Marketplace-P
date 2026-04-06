import { Card, Carousel, Badge, Button, Modal, Form } from 'react-bootstrap'
import Link from "next/link";
import { useState } from "react";

export default function SneakerCard({ sneaker, isVaultView, refreshVault }) {
  const isDeal = sneaker.price < sneaker.avgMarketPrice;
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [alertSaved, setAlertSaved] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [priceUpdating, setPriceUpdating] = useState(false);

  // New Relist Modal States
  const [showRelistModal, setShowRelistModal] = useState(false);
  const [relistQty, setRelistQty] = useState(sneaker.quantity || 1);

  // Handle standard price updates
  const handleUpdatePrice = async () => {
    if (!newPrice || parseFloat(newPrice) <= 0) { alert("Please enter a valid price."); return; }
    setPriceUpdating(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price: parseFloat(newPrice) }),
      });
      if (!res.ok) throw new Error();
      setShowPriceModal(false);
      setNewPrice("");
      if (refreshVault) refreshVault();
    } catch { alert("Could not update price."); }
    finally { setPriceUpdating(false); }
  };

  // Handle setting user price alerts
  const handleSetAlert = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { alert("Please log in to set a price alert."); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/price-alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sneakerId: sneaker.id,
          targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        }),
      });
      if (res.status === 409) { alert("You already have an alert for this sneaker."); return; }
      if (!res.ok) throw new Error();
      setAlertSaved(true);
      setTimeout(() => { setShowAlertModal(false); setAlertSaved(false); setTargetPrice(""); }, 1200);
    } catch { alert("Could not set alert."); }
  };

  // Handle Initial Listing
  const handleListSneaker = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}/list`, {
          method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to list sneaker");
      alert("Sneaker is now on the marketplace!");
      if (refreshVault) refreshVault();
    } catch (error) { alert("Could not list sneaker"); }
  };

  // NEW: Handle Relisting with quantity
  const handleRelist = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}/relist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: relistQty })
      });
      if (!response.ok) throw new Error("Failed to relist");
      setShowRelistModal(false);
      if (refreshVault) refreshVault();
    } catch (error) { alert("Could not relist"); }
  };

  // NEW: Cancel active listing to test the relist button
  const handleCancelListing = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}/cancel`, {
          method: "PUT", headers: { Authorization: `Bearer ${token}` }
      });
      if (refreshVault) refreshVault();
    } catch (error) { alert("Could not cancel"); }
  }

  // Handle Hard Deletion
  const handleDeleteSneaker = async () => {
    if (!window.confirm(`Delete ${sneaker.brand} ${sneaker.model}?`)) return;
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (refreshVault) refreshVault();
    } catch (error) { alert("Could not delete sneaker."); }
  };

  return (
    <Card className="h-100 border-0 premium-card overflow-hidden">
      <Carousel interval={null} indicators={true} className="bg-body-tertiary">
        {['front', 'side', 'sole'].map(view => (
            <Carousel.Item key={view}>
            <div className="img-zoom-container">
                <img src={sneaker.images?.[view]} alt={`${view} View`} className="d-block w-100 zoom-img" style={{ objectFit: "cover", height: "260px" }} />
            </div>
            </Carousel.Item>
        ))}
      </Carousel>

      <Card.Body className="d-flex flex-column p-4">
        <Card.Title className="d-flex justify-content-between align-items-start mb-3">
          <span className="fw-bold fs-5 text-truncate" style={{ maxWidth: "70%" }}>
            {sneaker.brand} {sneaker.model}
          </span>
          <div className="d-flex gap-2 align-items-center">
            {isDeal && !isVaultView && <Badge bg="success" className="px-2 py-1 shadow-sm">Deal!</Badge>}
            
            {/* Status Badges */}
            {isVaultView && sneaker.status === "draft" && <Badge bg="secondary" className="px-2 py-1 shadow-sm">Draft</Badge>}
            {isVaultView && sneaker.status === "active" && <Badge bg="success" className="px-2 py-1 shadow-sm">Live</Badge>}
            {isVaultView && sneaker.status === "cancelled" && <Badge bg="danger" className="px-2 py-1 shadow-sm">Cancelled</Badge>}
            {isVaultView && sneaker.status === "expired" && <Badge bg="warning" className="px-2 py-1 shadow-sm text-dark">Expired</Badge>}

            {isVaultView && (
              <Button variant="outline-danger" size="sm" className="border-0 p-1 rounded-circle" onClick={handleDeleteSneaker} title="Delete">✕</Button>
            )}
          </div>
        </Card.Title>

        <Card.Text as="div" className="mb-4">
          <ul className="list-unstyled mb-3 bg-body-tertiary p-3 rounded border-0">
            <li className="mb-2"><strong className="text-muted">Condition:</strong> {sneaker.condition}</li>
            <li className="mb-2"><strong className="text-muted">Size:</strong> US {sneaker.size}</li>
            <li><strong className="text-muted">Qty Available:</strong> {sneaker.quantity || 1}</li>
          </ul>

          <div className="d-flex justify-content-between align-items-end mt-4">
            <div>
              <small className="text-muted d-block mb-1 text-uppercase">Your Price</small>
              <span className="fs-3 fw-bold text-primary">${sneaker.price}</span>
            </div>
          </div>
        </Card.Text>

        {/* VAULT CONTROLS */}
        {isVaultView && (
          <Button variant="outline-secondary" size="sm" className="w-100 rounded-pill mb-2" onClick={() => { setNewPrice(sneaker.price); setShowPriceModal(true); }}>
            ✏️ Edit Price
          </Button>
        )}

        {isVaultView && sneaker.status === "draft" && (
          <Button variant="success" className="w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm" onClick={() => setShowPayoutModal(true)}>List</Button>
        )}

        {/* NEW: Cancel Button for Active Listings */}
        {isVaultView && sneaker.status === "active" && (
           <Button variant="outline-danger" className="w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm" onClick={handleCancelListing}>Cancel Listing</Button>
        )}

        {/* NEW: Relist Button for Expired/Cancelled */}
        {isVaultView && (sneaker.status === "cancelled" || sneaker.status === "expired") && (
          <Button variant="primary" className="w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm" onClick={() => setShowRelistModal(true)}>♻️ Relist Items</Button>
        )}

        {!isVaultView && (
          <div className="d-flex gap-2 mt-auto">
            <Link href={`/sneaker/${sneaker.id}`} className="btn btn-primary flex-grow-1 fw-bold py-2 rounded-pill shadow-sm">View Details</Link>
            <Button variant="outline-warning" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => setShowAlertModal(true)}>🔔</Button>
          </div>
        )}
      </Card.Body>

      {/* Relist Modal */}
      <Modal show={showRelistModal} onHide={() => setShowRelistModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">♻️ Relist Inventory</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Quantity to Relist</Form.Label>
            <Form.Control type="number" min="1" value={relistQty} onChange={(e) => setRelistQty(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="rounded-pill" onClick={() => setShowRelistModal(false)}>Cancel</Button>
          <Button variant="primary" className="rounded-pill fw-bold" onClick={handleRelist}>Confirm Relist</Button>
        </Modal.Footer>
      </Modal>

      {/* Other Modals (Payout, Price, Alert) hidden for brevity but remain the same structurally */}
    </Card>
  );
}