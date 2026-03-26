import { Card, Carousel, Badge, Button } from 'react-bootstrap'

export default function SneakerCard({ sneaker, isVaultView, refreshVault }) {
    const isDeal = sneaker.price < sneaker.avgMarketPrice

    const handleListSneaker = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://localhost:5000/api/vault/${sneaker.id}/list`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to list sneaker");
            
            alert("Sneaker is now on the marketplace!");
            if (refreshVault) refreshVault();

        } catch (error) {
            console.error(error);
            alert("Could not list sneaker");
        }
    };

    const handleDeleteSneaker = async () => {
        if (!window.confirm(`Are you sure you want to delete your ${sneaker.brand} ${sneaker.model}?`)) return;

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://localhost:5000/api/vault/${sneaker.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to delete sneaker");
            
            if (refreshVault) refreshVault();

        } catch (error) {
            console.error(error);
            alert("Could not delete sneaker.");
        }
    };

    return (
        <Card className="h-100 border-0 premium-card overflow-hidden">
            <Carousel interval={null} indicators={true} className="bg-body-tertiary">
                <Carousel.Item>
                    <div className="img-zoom-container">
                        <img src={sneaker.images?.front} alt="Front View" className="d-block w-100 zoom-img" style={{ objectFit: 'cover', height: '260px' }} />
                    </div>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="img-zoom-container">
                        <img src={sneaker.images?.side} alt="Side View" className="d-block w-100 zoom-img" style={{ objectFit: 'cover', height: '260px' }} />
                    </div>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="img-zoom-container">
                        <img src={sneaker.images?.sole} alt="Sole View" className="d-block w-100 zoom-img" style={{ objectFit: 'cover', height: '260px' }} />
                    </div>
                </Carousel.Item>
            </Carousel>

            <Card.Body className="d-flex flex-column p-4">
                <Card.Title className="d-flex justify-content-between align-items-start mb-3">
                    <span className="fw-bold fs-5 text-truncate" style={{maxWidth: '70%'}}>
                        {sneaker.brand} {sneaker.model}
                    </span>
                    <div className="d-flex gap-2 align-items-center">
                        {isDeal && !isVaultView && (
                            <Badge bg="success" className="px-2 py-1 shadow-sm">Deal!</Badge>
                        )}
                        {isVaultView && !sneaker.isPublic && (
                            <Badge bg="secondary" className="px-2 py-1 shadow-sm">Draft</Badge>
                        )}
                        {isVaultView && sneaker.isPublic && (
                            <Badge bg="success" className="px-2 py-1 shadow-sm">Live</Badge>
                        )}

                        {/*The Delete Button */}
                        {isVaultView && (
                            <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="border-0 p-1 rounded-circle"
                                onClick={handleDeleteSneaker}
                                title="Delete Sneaker"
                                style={{ width: '28px', height: '28px', lineHeight: '14px', fontSize: '12px' }}
                            >
                                ✕
                            </Button>
                        )}
                    </div>
                </Card.Title>

                <Card.Text as="div" className="mb-4">
                    <ul className="list-unstyled mb-3 bg-body-tertiary p-3 rounded border-0">
                        <li className="mb-2"><strong className="text-muted">Condition:</strong> {sneaker.condition}</li>
                        <li className="mb-2"><strong className="text-muted">Original Box:</strong> {sneaker.originalBox ? 'Yes' : 'No'}</li>
                        <li><strong className="text-muted">Size:</strong> US {sneaker.size}</li>
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

                {isVaultView && !sneaker.isPublic ? (
                    <Button variant="success" className="w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm" onClick={handleListSneaker}>
                        List
                    </Button>
                ) : (
                    <button className="btn btn-primary w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm">
                        View Details
                    </button>
                )}
            </Card.Body>
        </Card>
    );
}