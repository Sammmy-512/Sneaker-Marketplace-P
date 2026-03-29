import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";

import TopNavBar from "@/components/TopNavBar";
import { themeAtom } from "@/store/store";

export default function Register() {
    const theme = useAtomValue(themeAtom);
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();

    const passwordValue = watch("password");

    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", theme);
    }, [theme]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        setServerError("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Registration failed");
            }

            alert("Account created successfully. Please sign in.");
            router.push("/login");
        } catch (err) {
            console.error(err);
            setServerError(err.message || "Failed to register");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <TopNavBar />

            <Container
                className="py-5 d-flex justify-content-center align-items-center"
                style={{ minHeight: "80vh" }}
            >
                <Row className="w-100 justify-content-center">
                    <Col md={6} lg={5} xl={4}>
                        <Card className="border premium-card p-4 shadow-sm">
                            <Card.Body>
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">Create account</h2>
                                    <p className="text-muted">Register to manage your sneaker vault</p>
                                </div>

                                {serverError && (
                                    <Alert variant="danger" className="border-0 shadow-sm">
                                        {serverError}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="mb-3">
                                        <label className="fw-semibold mb-2">Username</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg bg-body-tertiary border"
                                            placeholder="Enter your username"
                                            {...register("username", {
                                                required: "Username is required",
                                                minLength: {
                                                    value: 3,
                                                    message: "Username must be at least 3 characters"
                                                }
                                            })}
                                        />
                                        {errors.username && (
                                            <p className="mt-1 m-2 text-danger">{errors.username.message}</p>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-semibold mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg bg-body-tertiary border"
                                            placeholder="name@gmail.com"
                                            {...register("email", {
                                                required: "Email is required"
                                            })}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 m-2 text-danger">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-semibold mb-2">Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg bg-body-tertiary border"
                                            placeholder="••••••••"
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters"
                                                }
                                            })}
                                        />
                                        {errors.password && (
                                            <p className="mt-1 m-2 text-danger">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="fw-semibold mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg bg-body-tertiary border"
                                            placeholder="••••••••"
                                            {...register("confirmPassword", {
                                                required: "Please confirm your password",
                                                validate: (value) =>
                                                    value === passwordValue || "Passwords do not match"
                                            })}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-1 m-2 text-danger">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 rounded-pill fw-bold py-2 fs-5 shadow-sm"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Creating Account..." : "Register"}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <small className="text-muted">
                                        Already have an account?{" "}
                                        <span
                                            className="text-primary fw-semibold"
                                            role="button"
                                            onClick={() => router.push("/login")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Sign in
                                        </span>
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}