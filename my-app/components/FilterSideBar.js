import { useForm } from "react-hook-form"
import { useAtom } from "jotai"
import useSWR from "swr"
import { filterAtom } from "@/store/store"
// Fetcher
const fetcher = async (url) => {
  const response = await fetch(url)
  if(!response.ok) throw new Error("Failed to fetch data")
    return response.json()
}
// SideBar
export default function FilterSideBar() {
    const [, setGlobalFilters] = useAtom(filterAtom)

    const {data: brandsList, error: brandsError, isLoading: brandsLoading} = useSWR('http://localhost:5000/api/brands', fetcher)

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            brands: [],
            minPrice: '',
            maxPrice: '',
            size: '',
            model: ''
        }
    })
    // OnSubmit function
    const onSubmit = (data) => {
        console.log("Submitted", data)
        setGlobalFilters(data)
    }

    return (
        // Prem-side bar
        <div className="p-4 bg-body rounded premium-sidebar">
            <form onSubmit={handleSubmit(onSubmit)}>
                
                <div className="mb-4">
                    <h4 className="fw-bold mb-3">Marketplace</h4>
                    <div className="position-relative">
                        <input 
                            type="text" 
                            className="form-control form-control-lg rounded-pill bg-body-tertiary border ps-3 fs-6" 
                            placeholder="Search by model..." 
                            {...register("model")} 
                        />
                    </div>
                </div>

                <hr className="text-muted opacity-25" />

                <h6 className="fw-bold mb-3 text-uppercase tracking-wider small text-muted">Filters</h6>

                {/* DYNAMIC BRAND FILTER */}
                <div className="mb-4">
                    <label className="fw-semibold mb-2">Brand</label>
                    <div>
                        {/* Loading State for Brands */}
                        {brandsLoading && <span className="text-muted small">Loading brands...</span>}
                        
                        {/* Error State for Brands */}
                        {brandsError && <span className="text-danger small">Failed to load brands.</span>}
                        
                        {/* Success State: Map through the database results */}
                        {brandsList && brandsList.map((brandName, index) => (
                            <label key={index} className="d-block mb-2" style={{ cursor: 'pointer' }}>
                                <input type="checkbox" value={brandName} className="me-2 form-check-input"  {...register("brands")}  /> 
                                {brandName}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-4">
                    <label className="fw-semibold mb-2">Price Range</label>
                    <div className="d-flex align-items-center gap-2">
                        <input 
                            type="number" 
                            placeholder="Min $" 
                            className="form-control bg-body-tertiary border" 
                            {...register("minPrice")} 
                        />
                        <span className="text-muted small">to</span>
                        <input 
                            type="number" 
                            placeholder="Max $" 
                            className="form-control bg-body-tertiary border" 
                            {...register("maxPrice")} 
                        />
                    </div>
                </div>

                {/* Size Filter */}
                <div className="mb-4">
                    <label className="fw-semibold mb-2">Size (US)</label>
                    <input 
                        type="number" 
                        className="form-control bg-body-tertiary border" 
                        placeholder="e.g. 10" 
                        {...register("size")} 
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 mt-2 shadow-sm">
                    Apply Filters
                </button>
            </form>
        </div>
    );
}

