/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/CustomInput";
import Button from "../../components/ui/Button/CustomButton";
import { signupApi } from "../../service/auth.service";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<{ name?: string, email?: string; password?: string }>(
        {}
    );

    const [loading, setLoading] = useState(false);

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

            const res = await signupApi(form);

            const { user, accessToken } = res.data;

            // ✅ Store tokens
            localStorage.setItem("accessToken", accessToken);

            // (optional) store user
            localStorage.setItem("user", JSON.stringify(user));

            // ✅ redirect
            navigate("/join-room");
        } catch (err: any) {
            console.error(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full w-[300px]">

            {/* Title */}
            <h2 className="text-3xl mb-6">
                Create Account
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

                <Input
                    name="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                />

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

                <Button
                    disabled={loading}
                    fullWidth
                    type="submit"
                    className="w-full py-2 rounded-lg text-white transition"
                >
                    {loading ? "Logging in..." : "Sign up"}

                </Button>
            </form>

            <div className="flex items-center my-5">
                <div className="flex-1 border-t border-gray-300/60"></div>
                <span className="px-3 text-xs text-gray-500">
                    Already a user?
                </span>
                <div className="flex-1 border-t border-gray-300/60"></div>
            </div>

            <Button variant="outline" fullWidth to="/login" className="rounded-lg">
                Sign in instead
            </Button>
        </div>
    )
}

export default Register