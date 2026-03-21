import { useEffect } from 'react';
import  useSwr from 'swr'
import {useAtom, useAtomValue} from 'jotai'
import { filterAtom, themeAtom } from '@/store/store';
import { Container, Row, Col } from "react-bootstrap";
import FilterSideBar from "@/components/FilterSideBar";
import SneakerCard from "@/components/SneakerCard";
import TopNavBar from '@/components/TopNavBar';

//Fetcher 
const fetcher = async (url) => {
    const response = await fetch(url)
    if(!response.ok) throw new Error('Failed to fetch data from the server')
      return response.json()
  }

export default function MarketPlaceHome() {
  // Using useAtomValue just to read-only
  const filters = useAtomValue(filterAtom)

  // r&w theme state
  const [theme] = useAtom(themeAtom)

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }, [theme])

  // // Toggle theme
  // const toggleTheme = () => {
  //   setTheme(prev => prev === 'light' ? 'dark' : 'light')
  // }

  // Query String
  const buildQueryString = () => {
    const queryParams = new URLSearchParams()
    if(filters.model) queryParams.append('model', filters.model)
    if(filters.size) queryParams.append('size', filters.size)
    if(filters.minPrice) queryParams.append('minPrice', filters.minPrice)
    if(filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice)
    if(filters.brands && filters.brands.length > 0) {
      queryParams.append('brands', filters.brands.join(','))
    }
    return queryParams.toString()
  }
  
  const apiURL = `http://localhost:8000/api/sneakers?${buildQueryString()}`
  // SWR
  const {data: sneakers, error, isLoading} = useSwr(apiURL, fetcher)

  //JSX part
  return (
        // We use an empty React Fragment (<> </>) to group the Navbar and the main Container together
        <>
            {/* The Navbar sits at the very top of the page */}
            <TopNavBar />

            <Container className="py-4">
                <Row>
                    <Col lg={3} md={4} className="mb-4">
                        <FilterSideBar />
                    </Col>
                    {/*Loading State */}
                    <Col lg={9} md={8}>
                        {isLoading && (
                            <div className="text-center py-5 my-5">
                                <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}></div>
                                <p className="mt-3 text-muted fw-semibold">Curating sneakers...</p>
                            </div>
                        )}
                        {/*Error State */}
                        {error && (
                            <div className="alert alert-danger shadow-sm border-0" role="alert">
                                <h5 className="alert-heading fw-bold">Connection Error</h5>
                                <p className="mb-0">{error.message}</p>
                            </div>
                        )}
                        {/*SUCCESS - No results found */}
                        {sneakers && sneakers.length === 0 && (
                            <div className="alert alert-warning text-center shadow-sm border-0 py-4" role="alert">
                                <h5 className="fw-bold">No results found</h5>
                                <p className="mb-0">There are no sneakers that match your exact filters. Try clearing some options.</p>
                            </div>
                        )}
                        {/*SUCCESS - results found */}
                        {sneakers && sneakers.length > 0 && (
                            <Row className="g-4"> 
                                {sneakers.map(sneaker => (
                                    <Col xl={4} md={6} key={sneaker.id}>
                                        <SneakerCard sneaker={sneaker} />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}