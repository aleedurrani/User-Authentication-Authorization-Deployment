import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyCaUh1JJX3EbZLI_-3AQKguNx81VLIbgY4",
    authDomain: "healthcaresystem-ffac8.firebaseapp.com",
    projectId: "healthcaresystem-ffac8",
    storageBucket: "healthcaresystem-ffac8.firebasestorage.app",
    messagingSenderId: "70847912770",
    appId: "1:70847912770:web:d37eba6eabd8916ebc06db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [googleId, setGoogleId] = useState('');
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const loginData = {
            Email: email,
            Password: password,
        };

        try {
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            if (response.status === 400) {
                throw new Error("Login failed. Please check your credentials.");
            }
            else if (response.status === 403) {
                throw new Error("A signup request is already pending for this email.");
            } else {
                const responseData = await response.json();
                localStorage.setItem("token", responseData.token); 
                localStorage.setItem("userId", responseData.user._id); 
                localStorage.setItem("userFullName", responseData.user.FullName);
                navigate("/profile")
            }

           
        } catch (err) {
            setSuccess("")
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

   
    const handleGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth, provider);

            const user = result.user;

            const response = await fetch("http://localhost:3001/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Email: user.email,
                }),
            });
            if (response.status === 400) {
                const response2 = await fetch("http://localhost:3001/auth/loginGoogle", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: user.email,
                        googleId: user.uid
                    }),
                });
                if (response2.status === 400) {
                setError("You already have an account through mauual Signup. Please Login Manually")
                }
                else if (response2.status === 200) {
                    const responseData = await response2.json();
                    localStorage.setItem("token", responseData.token); 
                    localStorage.setItem("userId", responseData.user._id);
                    localStorage.setItem("userFullName", responseData.user.FullName);
                    navigate("/profile")
                }

            } else if (response.status === 403) {
                
                setError("You already have a pending signup request.")
            }
            else {
                setIsRoleModalOpen(true)
                setEmail(user.email)
                setFirstName(user.displayName.split(' ')[0])
                setLastName(user.displayName.split(' ')[1])
                setGoogleId(user.uid)
            }



        } catch (err) {
            setError(err.message);
        }
    };

    
    const handleRoleSubmit = async () => {
        if (role) {
            setRole(role);
            setIsRoleModalOpen(false);

            try {
                const response = await fetch("http://localhost:3001/auth/registerGoogle", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        Email: email,
                        FirstName: firstName,
                        LastName: lastName,
                        Role: role,
                        GoogleId: googleId
                    }),
                });

                if (response.ok) {
                    setEmail('')
                    setPassword('');
                    setFirstName('');
                    setLastName('');
                    setRole('');
                    setError("")
                    setSuccess("Signup request has been submitted. You'll be notified via email");
                } else {
                    setEmail('')
                    setPassword('');
                    setFirstName('');
                    setLastName('');
                    setRole('');
                    setSuccess("")
                    setError("Registration failed. Please try again.");
                }
            } catch (error) {
                setError(`Error: ${error.message}`);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-center mb-6">
                    <img src="/logo512.png" alt="Logo" className="w-32 h-32" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Login
                </h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && (
                        <p className="mb-4 text-green-500 text-center">
                            {success}
                        </p>
                    )}
                
                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        onClick={handleGoogleAuth}
                        className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FaGoogle className="text-red-500" size={20} />
                    </button>
                </div>
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <a href="/resetpassword" className="text-blue-500 hover:underline">
                        Reset password
                    </a>
                    <span className="mx-2 text-gray-500">•</span>
                    <a href="/" className="text-blue-500 hover:underline">
                        New user? Sign up
                    </a>
                </div>
            </div>
            {isRoleModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Select Your Role</h2>
                        <button
                            onClick={() => setIsRoleModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-6">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select your role</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Patient">Patient</option>
                            <option value="Lab Technician">Lab Technician</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsRoleModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRoleSubmit}
                            disabled={!role}
                            className={`px-4 py-2 rounded-md text-white ${role
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default LoginPage;