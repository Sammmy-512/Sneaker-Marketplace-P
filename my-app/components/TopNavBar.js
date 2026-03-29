import { Navbar, Container, Nav } from "react-bootstrap";
import { useAtom } from "jotai";
import { themeAtom } from "@/store/store";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";

const fetcher = (url) => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
        if (!r.ok) return null;
        return r.json();
    });
};

export default function TopNavBar() {
    const [theme, setTheme] = useAtom(themeAtom);
    const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

    const [showNotifs, setShowNotifs] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("access_token"));
    }, []);

    const { data: notifications, mutate } = useSWR(
        isLoggedIn ? `${process.env.NEXT_PUBLIC_API_URL}/api/notifications` : null,
        fetcher,
        { refreshInterval: 10000 }
    );

    const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;

    const markAllRead = async () => {
        const token = localStorage.getItem("access_token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        mutate();
    };

    const markOneRead = async (id) => {
        const token = localStorage.getItem("access_token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        mutate();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <Navbar className="bg-body-tertiary shadow-sm border-bottom" sticky="top" expand="md">
            <Container>
                <Navbar.Brand as={Link} href="/" className="d-flex align-items-center fw-bold fs-4 text-decoration-none text-body">
                    <img src="/emblem.jpg" alt="Sneaker Marketplace Emblem" width="32" height="32" className="me-2 rounded" />
                    <span className="ms-2 tracking-tight">Sneaker Marketplace</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav className="me-4 align-items-center gap-3">
                        <Nav.Link as={Link} href="/vault" className="fw-semibold text-body">My Vault</Nav.Link>
                        <Nav.Link as={Link} href="/wishlist" className="fw-semibold text-body">Wishlist</Nav.Link>
                        <Nav.Link as={Link} href="/login" className="fw-semibold text-body">Login</Nav.Link>
                        <Nav.Link as={Link} href="/registration" className="fw-semibold text-body">Registration</Nav.Link>

                        {/* Notification Bell */}
                        {isLoggedIn && (
                            <div className="position-relative" ref={dropdownRef}>
                                <button
                                    className="btn btn-sm btn-outline-secondary rounded-circle p-1 position-relative"
                                    style={{ width: 36, height: 36 }}
                                    onClick={() => setShowNotifs((v) => !v)}
                                    title="Notifications"
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifs && (
                                    <div className="position-absolute end-0 mt-2 bg-body border rounded shadow-lg" style={{ width: 340, zIndex: 1050, maxHeight: 420, overflowY: "auto" }}>
                                        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                                            <span className="fw-bold">Notifications</span>
                                            {unreadCount > 0 && (
                                                <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={markAllRead}>
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        {!notifications || notifications.length === 0 ? (
                                            <div className="text-center text-muted py-4 small">No notifications yet</div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`px-3 py-2 border-bottom small d-flex gap-2 align-items-start ${!n.isRead ? "bg-primary bg-opacity-10" : ""}`}
                                                    style={{ cursor: n.isRead ? "default" : "pointer" }}
                                                    onClick={() => !n.isRead && markOneRead(n.id)}
                                                >
                                                    <span>{n.isRead ? "✉️" : "🔵"}</span>
                                                    <div>
                                                        <div>{n.message}</div>
                                                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                            {new Date(n.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </Nav>

                    <button onClick={toggleTheme} className={`btn btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm d-flex align-items-center ${theme === "light" ? "btn-dark" : "btn-light"}`}>
                        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                    </button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
