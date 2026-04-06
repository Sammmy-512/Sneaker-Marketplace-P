import { Card, Carousel, Badge, Button, Modal, Form } from 'react-bootstrap'
import Link from "next/link";
import { useState } from "react";

export default function SneakerCard({ sneaker, isVaultView, refreshVault }) {
  const isDeal = sneaker.price < sneaker.avgMarketPrice;
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showRelistModal, setShowRelistModal] = useState(false);
  const [relistQty, setRelistQty] = useState(sneaker.quantity || 1);
  
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [alertSaved, setAlertSaved] = useState(false);
  
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [priceUpdating, setPriceUpdating] = useState(false);

  const handleListSneaker = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}/list`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to list sneaker");

      alert("Sneaker is now on the marketplace!");
      if (refreshVault) refreshVault();
    } catch (error) {
      alert("Could not list sneaker");
    }
  };

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
    } catch (error) {
      alert("Could not relist");
    }
  };

  const handleCancelListing = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to cancel listing");
      if (refreshVault) refreshVault();
    } catch (error) {
      alert("Could not cancel");
    }
  }

  const handleDeleteSneaker = async () => {
    if (!window.confirm(`Are you sure you want to delete your ${sneaker.brand} ${sneaker.model}?`)) return;

    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vault/${sneaker.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to delete sneaker");
      if (refreshVault) refreshVault();
    } catch (error) {
      alert("Could not delete sneaker.");
    }
  };

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
    } catch { 
      alert("Could not update price."); 
    } finally { 
      setPriceUpdating(false); 
    }
  };

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
    } catch { 
      alert("Could not set alert."); 
    }
  };

  return (
    <Card className="h-100 border-0 premium-card overflow-hidden">
      <Carousel interval={null} indicators={true} className="bg-body-tertiary">
        <Carousel.Item>
          <div className="img-zoom-container">
            <img src={sneaker.images?.front} alt="Front View" className="d-block w-100 zoom-img" style={{ objectFit: "cover", height: "260px" }} />
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="img-zoom-container">
            <img src={sneaker.images?.side} alt="Side View" className="d-block w-100 zoom-img" style={{ objectFit: "cover", height: "260px" }} />
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="img-zoom-container">
            <img src={sneaker.images?.sole} alt="Sole View" className="d-block w-100 zoom-img" style={{ objectFit: "cover", height: "260px" }} />
          </div>
        </Carousel.Item>
      </Carousel>

      <Card.Body className="d-flex flex-column p-4">
        <Card.Title className="d-flex justify-content-between align-items-start mb-3">
          <span className="fw-bold fs-5 text-truncate" style={{ maxWidth: "70%" }}>
            {sneaker.brand} {sneaker.model}
          </span>
          <div className="d-flex gap-2 align-items-center">
            {isDeal && !isVaultView && (
              <Badge bg="success" className="px-2 py-1 shadow-sm">Deal!</Badge>
            )}
            
            {isVaultView && (sneaker.status === "draft" || (!sneaker.status && !sneaker.isPublic)) && (
              <Badge bg="secondary" className="px-2 py-1 shadow-sm">Draft</Badge>
            )}
            
            {isVaultView && (sneaker.status === "active" || (!sneaker.status && sneaker.isPublic)) && (
              <Badge bg="success" className="px-2 py-1 shadow-sm">Live</Badge>
            )}

            {isVaultView && sneaker.status === "cancelled" && (
              <Badge bg="danger" className="px-2 py-1 shadow-sm">Cancelled</Badge>
            )}

            {isVaultView && sneaker.status === "expired" && (
              <Badge bg="warning" className="px-2 py-1 shadow-sm text-dark">Expired</Badge>
            )}

            {isVaultView && (
              <Button
                variant="outline-danger"
                size="sm"
                className="border-0 p-1 rounded-circle"
                onClick={handleDeleteSneaker}
                title="Delete Sneaker"
                style={{ width: "28px", height: "28px", lineHeight: "14px", fontSize: "12px" }}
              >✕</Button>
            )}
          </div>
        </Card.Title>

        <Card.Text as="div" className="mb-4">
          <ul className="list-unstyled mb-3 bg-body-tertiary p-3 rounded border-0">
            <li className="mb-2"><strong className="text-muted">Condition:</strong> {sneaker.condition}</li>
            <li className="mb-2"><strong className="text-muted">Original Box:</strong> {sneaker.originalBox ? "Yes" : "No"}</li>
            <li className="mb-2"><strong className="text-muted">Size:</strong> US {sneaker.size}</li>
            <li><strong className="text-muted">Qty Available:</strong> {sneaker.quantity || 1}</li>
          </ul>

          <div className="d-flex justify-content-between align-items-end mt-4">
            <div>
              <small className="text-muted d-block mb-1 text-uppercase tracking-wider">Your Price</small>
              <span className="fs-3 fw-bold text-primary">${sneaker.price}</span>
            </div>
            <div className="text-end">
              <small className="text-muted d-block mb-1 text-uppercase tracking-wider">Avg Market</small>
              <strike className="text-danger fw-semibold opacity-75">${sneaker.avgMarketPrice}</strike>
            </div>
          </div>
        </Card.Text>

        {isVaultView && (
          <Button variant="outline-secondary" size="sm" className="w-100 rounded-pill mb-2 fw-bold" onClick={() => { setNewPrice(sneaker.price); setShowPriceModal(true); }}>
            ✏️ Edit Price
          </Button>
        )}

        {isVaultView && (sneaker.status === "draft" || (!sneaker.status && !sneaker.isPublic)) && (
          <Button variant="success" className="w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm" onClick={() => setShowPayoutModal(true)}>
            List
          </Button>
        )}

        {isVaultView && (sneaker.status === "active" || (!sneaker.status && sneaker.isPublic)) && (
          <Button variant="outline-danger" className="w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm" onClick={handleCancelListing}>
            Cancel Listing
          </Button>
        )}

        {isVaultView && (sneaker.status === "cancelled" || sneaker.status === "expired") && (
          <Button variant="primary" className="w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm" onClick={() => setShowRelistModal(true)}>
            ♻️ Relist Items
          </Button>
        )}

        {!isVaultView && (
          <div className="d-flex gap-2 mt-auto">
            <Link href={`/sneaker/${sneaker.id}`} className="btn btn-primary flex-grow-1 fw-bold py-2 rounded-pill shadow-sm">
              View Details
            </Link>
            <Button variant="outline-warning" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => setShowAlertModal(true)}>
              🔔
            </Button>
          </div>
        )}
      </Card.Body>

      <Modal show={showPayoutModal} onHide={() => setShowPayoutModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Confirm Listing</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted mb-4">
            Review your payout before listing <strong>{sneaker.brand} {sneaker.model}</strong> on the marketplace.
          </p>
          <div className="bg-body-tertiary rounded p-4 border">
            <h6 className="fw-bold mb-3">Payout Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Listing Price</span>
              <span className="fw-semibold">${parseFloat(sneaker.price).toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Marketplace Fee (10%)</span>
              <span className="fw-semibold text-danger">- ${(parseFloat(sneaker.price) * 0.1).toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between">
              <span className="fw-bold">Final Payout</span>
              <span className="fw-bold text-success">${(parseFloat(sneaker.price) * 0.9).toFixed(2)}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowPayoutModal(false)}>Cancel</Button>
          <Button variant="success" className="rounded-pill px-4 fw-bold" onClick={() => { setShowPayoutModal(false); handleListSneaker(); }}>Confirm & List</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRelistModal} onHide={() => setShowRelistModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">♻️ Relist Inventory</Modal.Title>
        </Modal.Header>
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

      <Modal show={showAlertModal} onHide={() => setShowAlertModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">🔔 Set Price Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertSaved ? (
            <div className="text-center py-3">
              <div style={{ fontSize: "2rem" }}>✅</div>
              <p className="fw-bold mt-2">Alert saved!</p>
            </div>
          ) : (
            <>
              <p className="text-muted small mb-3">You'll be notified when <strong>{sneaker.brand} {sneaker.model}</strong> drops in price.</p>
              <Form.Group>
                <Form.Label className="fw-semibold">Target Price (optional)</Form.Label>
                <Form.Control type="number" placeholder="Only notify me at or below $..." value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
                <Form.Text className="text-muted">Leave blank to be notified on any price drop.</Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        {!alertSaved && (
          <Modal.Footer>
            <Button variant="secondary" className="rounded-pill" onClick={() => setShowAlertModal(false)}>Cancel</Button>
            <Button variant="warning" className="rounded-pill fw-bold px-4" onClick={handleSetAlert}>Save Alert</Button>
          </Modal.Footer>
        )}
      </Modal>

      <Modal show={showPriceModal} onHide={() => setShowPriceModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">✏️ Edit Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">New Price ($)</Form.Label>
            <Form.Control type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="rounded-pill" onClick={() => setShowPriceModal(false)}>Cancel</Button>
          <Button variant="primary" className="rounded-pill fw-bold" onClick={handleUpdatePrice} disabled={priceUpdating}>
            {priceUpdating ? "Updating..." : "Update Price"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
