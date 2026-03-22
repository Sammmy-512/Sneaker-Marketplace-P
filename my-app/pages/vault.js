import { useEffect } from "react";
import useSWR from 'swr'
import { useAtomValue } from "jotai";
import { themeAtom } from "@/store/store";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";
import TopNavBar from "@/components/TopNavBar";
import SneakerCard from "@/components/SneakerCard";

const fetcherWithToken = async(url) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }
    })

    if(!response.ok) throw new Error("Failed to fetch data")
    return response.json()
}

export default function Vault() {
    const theme = useAtomValue(themeAtom)

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme)
    }, [theme])

    const {data: sneakers, error, isLoading} = useSWR('http://localhost:5000/api/vault', fetcherWithToken)

    return (
        <>
            <TopNavBar />
            <Container className="py-5">
                <div>
                    <div>
                        <h1 className="fw-bold mb-1">My Vault</h1>
                        <p className="text-muted mb-0">Manage my sneakers</p>
                    </div>
                    {/*Link to create a lisitng */}
                    <Link href="/create-listing" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                        + Add Sneaker
                    </Link>
                    {isLoading && (
                        <div className="text-center py-5 my-5">
                        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}></div>
                        <p className="mt-3 text-muted fw-semibold">Opening vault...</p>
                    </div>
                    )}

                    {error && (
                        <div className="alert alert-danger shadow-sm border-0 premium-card p-4" role="alert">
                        <h5 className="alert-heading fw-bold">Authentication Required</h5>
                        <p className="mb-0">Please ensure you are logged in and the backend server is running to view your vault.</p>
                    </div>
                    )}

                    {sneakers && sneakers.length === 0 && (
                        <div className="alert alert-warning text-center shadow-sm border-0 py-5 premium-card" role="alert">
                        <h5 className="fw-bold">Your vault is empty</h5>
                        <p className="mb-0">You haven't listed any sneakers for sale yet. Click "Add Sneaker" to get started.</p>
                    </div>
                    )}

                    {sneakers && sneakers.length > 0 && (
                        <Row className="g-4">
                        {sneakers.map(sneaker => (
                            <Col xl={4} md={6} key={sneaker.id}>
                                <SneakerCard sneaker={sneaker} />
                            </Col>
                        ))}
                    </Row>
                    )}
                </div>
            </Container>
        </>
    )
}