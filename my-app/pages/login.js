import { useForm } from "react-hook-form";
import {Container, Row, Col, Card} from 'react-bootstrap'
import TopNavBar from "@/components/TopNavBar";
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { themeAtom } from "@/store/store";
import { useRouter } from "next/router";

export default function Login() {
    const theme = useAtomValue(themeAtom)
    const router = useRouter()

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme)
    }, [theme])

    const {register, handleSubmit, formState: {errors}} = useForm()

    const onSubmit = async (data) => {
        console.log("Submitted", data)

///////////////////////////////////////////
            //Flask
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                })

                if(!response.ok) throw new Error("Login failed")
                const result = response.json()

                localStorage.setItem('access_token', result.access_token)

                router.push('/vault')
            } catch(err) {
                console.log(err)
                alert('Invalid Credentials!')
            }
////////////////////////////////////////
    }
 
    return (
        <>
            <TopNavBar />
            <Container className="py-5 d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
                <Row className="w-100 justify-content-center">
                    <Col md={5} lg={5} xl={4}>
                        <Card className="border premium-card p-4 shadow-sm">
                            <Card.Body>
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">Welcome back</h2>
                                    <p className="text-muted">Sign in to manage your vault</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="mb-3">
                                        <label className="fw-semibold mb-2">Email Address</label>
                                        <input type="email" className="form-control form-control-lg bg-body-tertiary border" placeholder="name@gmail.com"
                                        {...register("email", {required: true})}/>
                                        {errors.email?.type === "required" && <p className="mt-1 m-2 text-danger">Email is required</p>}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="fw-semibold mb-2">Password</label>
                                        <input type="password" className="form-control form-control-lg bg-body-tertiary border" placeholder="••••••••"  {...register("password", { required: true })} />
                                        {errors.password?.type === "required" && <p className="mt-1 m-2 text-danger">Password is required</p>}
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 fs-5 shadow-sm">
                                        Sign In
                                    </button>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}