import { useEffect, useState, useRef } from "react";
import useSWR from 'swr';
import { useAtomValue } from "jotai";
import { themeAtom } from "@/store/store";
import { Container, Row, Col, Modal, Form, Button, Badge } from "react-bootstrap";
import TopNavBar from "@/components/TopNavBar";
import SneakerCard from "@/components/SneakerCard";
import { useForm } from "react-hook-form";
import { isAuthenticated } from "@/lib/authenticate";
import { useRouter } from "next/router";

// SWR Fetcher
const fetcherWithToken = async(url) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }
    });
    if(!response.ok) throw new Error("Failed to fetch data");
    return response.json();
}

export default function Vault() {
    const router = useRouter()
    
    const theme = useAtomValue(themeAtom);
    
    // Drag & Drop
    const [showModal, setShowModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef(null);

    const { register, handleSubmit, reset } = useForm();

    // Fetch Vault Data
    const { data: sneakers, error, isLoading, mutate } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/vault`, fetcherWithToken);

    useEffect(() => {
        if (isAuthenticated()) {
        router.push("/login");
    }
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    // Drag and Drop logic
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        // Convert FileList to Arra(3 image max)
        const newFiles = Array.from(files);
        setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 3));
    };

    const removeFile = (indexToRemove) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Form submission
    const onSubmit = async (data) => {
        if (uploadedFiles.length < 1) {
            alert("Upload at least one image");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append("brand", data.brand);
            formData.append("model", data.model);
            formData.append("condition", data.condition);
            formData.append("size", data.size);
            formData.append("price", data.price);
            formData.append("avgMarketPrice", data.avgMarketPrice || 0);
            formData.append("originalBox", data.originalBox ? 'true' : 'false');
            
            // Append
            if (uploadedFiles[0]) formData.append("image_front", uploadedFiles[0]);
            if (uploadedFiles[1]) formData.append("image_side", uploadedFiles[1]);
            if (uploadedFiles[2]) formData.append("image_sole", uploadedFiles[2]);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to add sneaker");

            // Success:
            setShowModal(false);
            setUploadedFiles([]);
            reset();
            mutate();

        } catch (err) {
            console.error(err);
            alert("Failed to save sneaker");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <TopNavBar />
            <Container className="py-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 className="fw-bold mb-1">My Vault</h1>
                        <p className="text-muted mb-0">Manage my sneakers</p>
                    </div>
                    {/* BUTTON OPENS THE MODAL */}
                    <button onClick={() => setShowModal(true)} className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                        + Add Sneaker
                    </button>
                </div>

                {isLoading && <p>Loading...</p>}
                {error && <p>Authentication Required</p>}
                {sneakers && sneakers.length === 0 && <p>Your vault is empty.</p>}

                {sneakers && sneakers.length > 0 && (
                    <Row className="g-4">
                        {sneakers.map(sneaker => (
                            <Col xl={4} md={6} key={sneaker.id}>
                                <SneakerCard sneaker={sneaker} isVaultView={true} refreshVault={mutate} />
                            </Col>
                        ))}
                    </Row>
                )}

                {/*ADD SNEAKAER  MODAL  */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold fs-3">Add to Vault</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pt-2">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-semibold">Brand</Form.Label>
                                    <Form.Control type="text" {...register("brand", { required: true })} />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-semibold">Model</Form.Label>
                                    <Form.Control type="text" {...register("model", { required: true })} />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-semibold">Condition</Form.Label>
                                    <Form.Select {...register("condition", { required: true })}>
                                        <option value="">Select...</option>
                                        <option value="Brand New">Brand New</option>
                                        <option value="Used">Used</option>
                                    </Form.Select>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-semibold">Size (US)</Form.Label>
                                    <Form.Control type="number" step="0.5" {...register("size", { required: true })} />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-semibold">Your Price ($)</Form.Label>
                                    <Form.Control type="number" step="0.01" {...register("price", { required: true })} />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-semibold">Avg Market Price ($)</Form.Label>
                                    <Form.Control type="number" step="0.01" {...register("avgMarketPrice")} />
                                </Col>
                            </Row>

                            {/* DRAG AND DROP ZONE */}
                            <div className="mt-4">
                                <Form.Label className="fw-semibold">Upload Images (Front, Side, Sole)</Form.Label>
                                <div 
                                    className={`p-5 text-center rounded border border-2 ${dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-dashed text-muted'}`}
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    onClick={() => inputRef.current.click()}
                                    style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                                >
                                    <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleChange} className="d-none" />
                                    <p className="mb-0 fw-semibold">Drag & drop images here, or click to select files</p>
                                    <small>(Max 3 images)</small>
                                </div>
                            </div>

                            {/* IMAGEs */}
                            {uploadedFiles.length > 0 && (
                                <div className="d-flex gap-3 mt-3">
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={idx} className="position-relative">
                                            <img src={URL.createObjectURL(file)} alt="preview" className="rounded object-fit-cover" width="80" height="80" />
                                            <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{cursor:'pointer'}} onClick={() => removeFile(idx)}>X</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold py-2 mt-4" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving to Vault...' : 'Save to Vault'}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </>
    );
}