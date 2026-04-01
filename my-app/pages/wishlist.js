import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Badge, Button, Form, Modal } from "react-bootstrap";
import TopNavBar from "@/components/TopNavBar";
import { useAtomValue } from "jotai";
import { themeAtom } from "@/store/store";
import useSWR from "swr";
import { useRouter } from "next/router";
import { isAuthenticated } from "@/lib/authenticate";

const fetcher = (url) => {
    const token = localStorage.getItem("access_token");
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
        if (!r.ok) return [];
        return r.json();
    });
};

export default function Wishlist() {
    const router = useRouter();
    

    const theme = useAtomValue(themeAtom);
    
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ label: "", brand: "", modelKeyword: "", minSize: "", maxSize: "", minPrice: "", maxPrice: "" });

    useEffect(() => {
        if (!isAuthenticated()) {
        router.push("/login");
    }
        document.documentElement.setAttribute("data-bs-theme", theme);
        //if (!localStorage.getItem("access_token")) router.push("/login");
    }, [theme]);

    const { data: wishlist, mutate } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, fetcher);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.label.trim()) return;
        setSubmitting(true);
        const token = localStorage.getItem("access_token");
        const payload = {
            label: form.label,
            brand: form.brand || null,
            modelKeyword: form.modelKeyword || null,
            minSize: form.minSize ? parseFloat(form.minSize) : null,
            maxSize: form.maxSize ? parseFloat(form.maxSize) : null,
            minPrice: form.minPrice ? parseFloat(form.minPrice) : null,
            maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null,
        };
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        setForm({ label: "", brand: "", modelKeyword: "", minSize: "", maxSize: "", minPrice: "", maxPrice: "" });
        setShowModal(false);
        setSubmitting(false);
        mutate();
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem("access_token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        mutate();
    };

    return (
        <>
            <TopNavBar />
            <Container className="py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">My Wishlist</h2>
                        <p className="text-muted mb-0">Save search criteria — get notified when a matching sneaker is listed.</p>
                    </div>
                    <Button variant="primary" className="rounded-pill px-4 fw-bold" onClick={() => setShowModal(true)}>
                        + Add Criteria
                    </Button>
                </div>

                {!wishlist ? (
                    <p className="text-muted">Loading...</p>
                ) : !Array.isArray(wishlist) || wishlist.length === 0 ? (
                    <Card className="border text-center py-5">
                        <Card.Body>
                            <div style={{ fontSize: "2.5rem" }}>🔍</div>
                            <h5 className="mt-3 fw-bold">No saved criteria yet</h5>
                            <p className="text-muted">Add criteria to get notified when matching sneakers are listed.</p>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row className="g-3">
                        {Array.isArray(wishlist) && wishlist.map((c) => (
                            <Col key={c.id} md={6} lg={4}>
                                <Card className="border h-100 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="fw-bold mb-0">{c.label}</h6>
                                            <Button variant="outline-danger" size="sm" className="rounded-pill px-2 py-0" onClick={() => handleDelete(c.id)}>
                                                ✕
                                            </Button>
                                        </div>
                                        <div className="d-flex flex-wrap gap-1 mt-2">
                                            {c.brand && <Badge bg="secondary">{c.brand}</Badge>}
                                            {c.modelKeyword && <Badge bg="info" text="dark">"{c.modelKeyword}"</Badge>}
                                            {(c.minSize || c.maxSize) && (
                                                <Badge bg="light" text="dark" className="border">
                                                    Size {c.minSize ?? "any"} – {c.maxSize ?? "any"}
                                                </Badge>
                                            )}
                                            {(c.minPrice || c.maxPrice) && (
                                                <Badge bg="success">
                                                    ${c.minPrice ?? "0"} – ${c.maxPrice ?? "∞"}
                                                </Badge>
                                            )}
                                            {!c.brand && !c.modelKeyword && !c.minSize && !c.maxSize && !c.minPrice && !c.maxPrice && (
                                                <span className="text-muted small">Matches any sneaker</span>
                                            )}
                                        </div>
                                        <div className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
                                            Added {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            {/* Add Criteria Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Add Wishlist Criteria</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAdd}>
                    <Modal.Body>
                        <p className="text-muted small mb-3">You'll be notified whenever a new listing matches all the criteria you set. Leave fields blank to match anything.</p>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Label <span className="text-danger">*</span></Form.Label>
                            <Form.Control name="label" value={form.label} onChange={handleChange} placeholder='e.g. "Jordan 1 under $200"' required />
                        </Form.Group>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Label className="fw-semibold">Brand</Form.Label>
                                <Form.Control name="brand" value={form.brand} onChange={handleChange} placeholder="Nike, Jordan…" />
                            </Col>
                            <Col>
                                <Form.Label className="fw-semibold">Model keyword</Form.Label>
                                <Form.Control name="modelKeyword" value={form.modelKeyword} onChange={handleChange} placeholder="Air Max, Dunk…" />
                            </Col>
                        </Row>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Label className="fw-semibold">Min Size</Form.Label>
                                <Form.Control type="number" step="0.5" name="minSize" value={form.minSize} onChange={handleChange} placeholder="e.g. 9" />
                            </Col>
                            <Col>
                                <Form.Label className="fw-semibold">Max Size</Form.Label>
                                <Form.Control type="number" step="0.5" name="maxSize" value={form.maxSize} onChange={handleChange} placeholder="e.g. 11" />
                            </Col>
                        </Row>
                        <Row className="g-2">
                            <Col>
                                <Form.Label className="fw-semibold">Min Price ($)</Form.Label>
                                <Form.Control type="number" name="minPrice" value={form.minPrice} onChange={handleChange} placeholder="0" />
                            </Col>
                            <Col>
                                <Form.Label className="fw-semibold">Max Price ($)</Form.Label>
                                <Form.Control type="number" name="maxPrice" value={form.maxPrice} onChange={handleChange} placeholder="500" />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="rounded-pill" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" className="rounded-pill fw-bold px-4" disabled={submitting}>
                            {submitting ? "Saving…" : "Save Criteria"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
