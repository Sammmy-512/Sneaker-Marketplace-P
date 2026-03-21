import {Card, Carousel} from 'react-bootstrap'

export default function SneakerCard({sneaker}) {
    const isDeal = sneaker.price < sneaker.avgMarketPrice

    return (
        <Card className="h-100 border-0 premium-card overflow-hidden">
            <Carousel interval={null} indicators={true} className="bg-body-tertiary">
                <Carousel.Item>
                    <div className="img-zoom-container">
                        <img src={sneaker.images?.front} alt="Front View" className="d-block w-100 zoom-img" style={{ objectFit: 'cover', height: '260px' }} />
                    </div>
                    <Carousel.Caption className="d-none d-md-block pb-0">
                        <span className="bg-dark text-white px-2 py-1 rounded small shadow-sm">Front</span>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="img-zoom-container">
                        <img src={sneaker.images?.side} alt="Side View" className="d-block w-100 zoom-img" style={{ objectFit: 'cover', height: '260px' }} />
                    </div>
                    <Carousel.Caption className="d-none d-md-block pb-0">
                        <span className="bg-dark text-white px-2 py-1 rounded small shadow-sm">Side</span>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="img-zoom-container">
                        <img src={sneaker.images?.sole} alt="Sole View" className="d-block w-100 zoom-img" style={{ objectFit: 'cover', height: '260px' }} />
                    </div>
                    <Carousel.Caption className="d-none d-md-block pb-0">
                        <span className="bg-dark text-white px-2 py-1 rounded small shadow-sm">Sole</span>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>

            <Card.Body className="d-flex flex-column p-4">
                <Card.Title className="d-flex justify-content-between align-items-start mb-3">
                    <span className="fw-bold fs-5">
                        {sneaker.brand} {sneaker.model}
                    </span>
                    {isDeal && (
                        <Badge bg="success" className="px-2 py-1 shadow-sm">Deal!</Badge>
                    )}
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

                <button className="btn btn-primary w-100 mt-auto fw-bold py-2 rounded-pill shadow-sm">
                    View Details
                </button>
            </Card.Body>
        </Card>
    );
}