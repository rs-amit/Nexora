/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/CustomInput";
import Button from "../../components/ui/Button/CustomButton";
import { signinApi } from "../../service/auth.service";
import { wakeEvents } from "../../lib/api";

const Login = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {}
    );

    const [loading, setLoading] = useState(false);
    const [waking, setWaking] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        const handleRetry = () => setWaking(true);
        wakeEvents.addEventListener("retry", handleRetry);
        return () => wakeEvents.removeEventListener("retry", handleRetry);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!form.email) newErrors.email = "Email is required";
        if (!form.password) newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);
            setFormError("");
            setWaking(false);

            const res = await signinApi(form);

            const { user, accessToken } = res.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/join-room");
        } catch (err: any) {
            console.error(err.response?.data?.message || err.message);
            setFormError(
                err.response?.status === 429
                    ? "The server is still waking up. Please try again in a few seconds."
                    : err.response?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
            setWaking(false);
        }
    };

    return (
        <div className="w-full w-[300px]">

            {/* Title */}
            <h2 className="text-3xl mb-6">
                Sign in
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

                <Input
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <Input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                {formError && (
                    <p className="text-xs text-red-500">{formError}</p>
                )}

                {waking && (
                    <p className="text-xs text-gray-500">
                        Server was asleep, waking it up now — this can take a few seconds…
                    </p>
                )}

                {/* Button */}

                <Button
                    disabled={loading}
                    fullWidth
                    type="submit"
                    className="w-full py-2 rounded-lg text-white transition"
                >
                    {loading ? "Logging in..." : "Sign in"}

                </Button>
            </form>

            <div className="flex items-center my-5">
                <div className="flex-1 border-t border-gray-300/60"></div>
                <span className="px-3 text-xs text-gray-500">
                    New to SketchStream?
                </span>
                <div className="flex-1 border-t border-gray-300/60"></div>
            </div>

            <Button variant="outline" fullWidth to="/register" className="rounded-lg">
                Create your SketchStream account
            </Button>
        </div>
    );
};

export default Login;