import { Navbar, Container} from "react-bootstrap";
import { useAtom } from "jotai";
import { themeAtom } from "@/store/store";

export default function TopNavBar() {
    //Theme toggle
    const [theme, setTheme] = useAtom(themeAtom)
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return (
        <Navbar className="bg-body-tertiary shadow-sm border-bottom" sticky="top">
            <Container>
                {/* BRANDING adn EMBLEM */}
                <Navbar.Brand href="/" className="d-flex align-items-center fw-bold fs-4">
                    {/*EMBLEM*/}
                    <img 
                        src="/emblem.jpg" 
                        alt="Sneaker Marketplace Emblem" 
                        width="32" 
                        height="32" 
                        className="me-2 rounded" 
                    />
                    {/* Name */}
                    <span className="ms-2 tracking-tight">Sneaker Marketplace</span>
                </Navbar.Brand>
                
                {/* Toggle theme buttoin */}
                <Navbar.Collapse className="justify-content-end">
                    <button onClick={toggleTheme} className={`btn btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm d-flex align-items-center ${theme === 'light' ? 'btn-dark' : 'btn-light'}`}> 
                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}