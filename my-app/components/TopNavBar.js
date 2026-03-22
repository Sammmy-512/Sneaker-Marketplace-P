import { Navbar, Container, Nav} from "react-bootstrap";
import { useAtom } from "jotai";
import { themeAtom } from "@/store/store";
import Link from "next/link";

export default function TopNavBar() {
    //Theme toggle
    const [theme, setTheme] = useAtom(themeAtom)
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return (
        <Navbar className="bg-body-tertiary shadow-sm border-bottom" sticky="top" expand="md">
            <Container>
                {/* BRANDING and EMBLEM */}
                <Navbar.Brand as={Link} href="/" className="d-flex align-items-center fw-bold fs-4 text-decoration-none text-body">
                    {/* EMBLEM */}
                    <img 
                        src="/emblem.jpg" 
                        alt="Sneaker Marketplace Emblem" 
                        width="32" 
                        height="32" 
                        className="me-2 rounded" 
                    />
                    {/* Name*/}
                    <span className="ms-2 tracking-tight">Sneaker Marketplace</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    {/*Navigation Links */}
                    <Nav className="me-4 align-items-center gap-3">
                        <Nav.Link as={Link} href="/vault" className="fw-semibold text-body">My Vault</Nav.Link>
                        <Nav.Link as={Link} href="/login" className="fw-semibold text-body">Login</Nav.Link>
                    </Nav>

                    {/* Toggle theme button */}
                    <button onClick={toggleTheme} className={`btn btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm d-flex align-items-center ${theme === 'light' ? 'btn-dark' : 'btn-light'}`}> 
                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}