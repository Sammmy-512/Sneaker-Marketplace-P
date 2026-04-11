import { useRouter } from "next/router";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { themeAtom } from "@/store/store";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import TopNavBar from "@/components/TopNavBar";
import Link from "next/link";

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch sneaker details");
  return response.json();
};

export default function SneakerDetails() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useAtomValue(themeAtom);
  
  // NEW FEATURE: State for loading button
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const {
    data: sneaker,
    error,
    isLoading,
  } = useSWR(
    id ? `${process.env.NEXT_PUBLIC_API_URL}/api/sneakers/${id}` : null,
    fetcher,
  );

  // NEW FEATURE: Buy Logic connecting to new backend route
  const handleBuy = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Please login to buy sneakers");
        router.push("/login");
        return;
    }
    
    setIsBuying(true);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sneakers/${id}/buy`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Failed to process transaction");
        
        alert("Payment Secured! The seller has been notified.");
        router.push("/vault");
    } catch (err) {
        alert("Transaction failed");
    } finally {
        setIsBuying(false);
    }
  };

  return (
    <>
      <TopNavBar />
      <Container className="py-5">
        {isLoading && (
          <div className="text-center py-5 my-5">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <p className="mt-3 text-muted fw-semibold">
              Loading sneaker details...
            </p>
          </div>
        )}
        {error && (
          <div className="alert alert-danger shadow-sm border-0" role="alert">
            <h5 className="alert-heading fw-bold">Could not load sneaker</h5>
            <p className="mb-0">{error.message}</p>
          </div>
        )}
        {sneaker && (
          <>
            <Link
              href="/"
              className="btn btn-outline-secondary rounded-pill px-4 mb-4 fw-semibold"
            >
              ← Back to Marketplace
            </Link>
            <Card className="border-0 premium-card overflow-hidden">
              <Row className="g-0">
                <Col md={6} className="p-4 bg-body-tertiary">
                  <Row className="g-3">
                    <Col xs={12}>
                      <img
                        src={sneaker.images?.front}
                        alt="Front View"
                        className="w-100 rounded"
                        style={{ objectFit: "cover", height: "300px" }}
                      />
                    </Col>
                    <Col xs={6}>
                      <img
                        src={sneaker.images?.side}
                        alt="Side View"
                        className="w-100 rounded"
                        style={{ objectFit: "cover", height: "150px" }}
                      />
                    </Col>
                    <Col xs={6}>
                      <img
                        src={sneaker.images?.sole}
                        alt="Sole View"
                        className="w-100 rounded"
                        style={{ objectFit: "cover", height: "150px" }}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col
                  md={6}
                  className="p-5 d-flex flex-column justify-content-between"
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h2 className="fw-bold">
                        {sneaker.brand} {sneaker.model}
                      </h2>
                      {sneaker.price < sneaker.avgMarketPrice && (
                        <Badge bg="success" className="px-3 py-2 shadow-sm">
                          Deal!
                        </Badge>
                      )}
                    </div>
                    <ul className="list-unstyled bg-body-tertiary p-4 rounded mb-4">
                      <li className="mb-3">
                        <strong className="text-muted">Condition:</strong>{" "}
                        <span className="ms-2">{sneaker.condition}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Size:</strong>{" "}
                        <span className="ms-2">US {sneaker.size}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Original Box:</strong>{" "}
                        <span className="ms-2">
                          {sneaker.originalBox ? "Yes" : "No"}
                        </span>
                      </li>
                      <li>
                        <strong className="text-muted">Brand:</strong>{" "}
                        <span className="ms-2">{sneaker.brand}</span>
                      </li>
                    </ul>
                    <div className="d-flex justify-content-between align-items-end mb-4">
                      <div>
                        <small className="text-muted d-block mb-1 text-uppercase">
                          Your Price
                        </small>
                        <span className="fs-2 fw-bold text-primary">
                          ${sneaker.price}
                        </span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block mb-1 text-uppercase">
                          Avg Market
                        </small>
                        <strike className="text-danger fw-semibold opacity-75">
                          ${sneaker.avgMarketPrice}
                        </strike>
                      </div>
                    </div>
                  </div>
                  {/* NEW FEATURE: Replaced static button with dynamic click handler */}
                  <button 
                    onClick={handleBuy} 
                    disabled={isBuying}
                    className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm fs-5"
                  >
                    {isBuying ? "Processing..." : "Buy Now"}
                  </button>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Container>
    </>
  );
}