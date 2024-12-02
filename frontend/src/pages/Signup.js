import React, { useState } from 'react';
import { FaGoogle} from 'react-icons/fa';
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [googleId, setGoogleId] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [pin, setPin] = useState(['', '', '', '', '']);
    const [returnedPin, setReturnedPin] = useState("")
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setError(null)
        setSuccess(null)
        e.preventDefault();


        if (step === 1) {
            console.log("hi")
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Email: email }),
                });

                if (response.status === 400) {
                    setStep(1);
                    setError("You already have an account. Please Login")
                } else if (response.status === 403) {
                    setStep(1);
                    setError("You already have a pending signup request.")
                }
                else {
                    try {
                        setSuccess('Wait for a few seconds...');
                        const response = await fetch(`${API_BASE_URL}/auth/verifyEmail`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ Email: email }),
                        });
                        if (response.ok) {
                            setSuccess('A PIN has been sent to your email. Please check and enter it above.');
                            const data = await response.json();
                            setReturnedPin(data.pin)
                            setStep(2);
                        } else {
                            if (response.status === 401) {
                                setError('Error sending email. Please try again later.');
                            }
                        }
                    } catch (err) {
                        setError('An error occurred. Please try again.');
                    }
                }

            } catch (err) {
                setError('An error occurred. Please try again.');
            }


        } else if (step === 2) {
            const pinString = pin.join('');
            if (pinString === String(returnedPin)) {
                setSuccess("Email Verification Successful")
                const data = {
                    FirstName: firstName,
                    LastName: lastName,
                    Email: email,
                    Password: password,
                    Role: role,
                };

                try {
                    const response = await fetch(`${API_BASE_URL}/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });


                    if (!response.ok) {
                        const errorData = await response.json();
                        setError(errorData.message || 'An error occurred');
                        setSuccess(false);
                        setStep(1)
                    } else {

                        setError(null);
                        setEmail('')
                        setPassword('');
                        setFirstName('');
                        setLastName('');
                        setPin(['', '', '', '', ''])
                        setRole('');
                        setSuccess("Signup request has been submitted. Youll be notified via email");

                        setStep(1)
                    }


                } catch (err) {
                    setError('Failed to connect to the server');
                    setSuccess(false);
                }
            } else {
                setError("Email Verification Failed")
                setPin(['', '', '', '', ''])
                setSuccess(null)
                setStep(1)
            }
        }


    };


    const handleGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth, provider);

            const user = result.user;

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Email: user.email,
                }),
            });
            if (response.status === 400) {
                const response2 = await fetch(`${API_BASE_URL}/auth/loginGoogle`, {
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
                setStep(1);
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
                setStep(1);
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

    const handlePinChange = (index, value) => {
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        if (value && index < 4) {
            document.getElementById(`pin-${index + 1}`).focus();
        }
    };

    const handleRoleSubmit = async () => {
        if (role) {
            setRole(role);
            setIsRoleModalOpen(false);

            try {
                const response = await fetch(`${API_BASE_URL}/auth/registerGoogle`, {
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
                    setPin(['', '', '', '', ''])
                    setRole('');
                    setError("")
                    setSuccess("Signup request has been submitted. You'll be notified via email");
                } else {
                    setEmail('')
                    setPassword('');
                    setFirstName('');
                    setLastName('');
                    setPin(['', '', '', '', ''])
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
        <div className="flex min-h-screen bg-white">
            <div className="flex-1 flex items-center justify-center p-10">
                <div className="relative w-full max-w-md mb-32">
                    <img src="/health.png" alt="Logo" className="w-full h-full mx-auto" />
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-white p-10">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Create a free account
                    </h2>
                    <div className="flex justify-center space-x-4 mb-6">
                        <button onClick={handleGoogleAuth} className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors">
                            <FaGoogle className="text-red-500 mr-2" size={20} />
                            <span>Google</span>
                        </button>
                    </div>
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">OR</span>
                        </div>
                    </div>

                    {/* Signup form */}
                    {step === 1 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <span className="absolute right-3 top-2 text-gray-400 cursor-pointer">?</span>
                            </div>
                            {email && (
                                <>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="flex space-x-4">
                                        <input
                                            type="text"
                                            placeholder="First name"
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last name"
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Doctor">Doctor</option>
                                            <option value="Patient">Patient</option>
                                            <option value="Lab Technician">Lab Technician</option>
                                        </select>
                                        <span className="absolute right-3 top-2 text-gray-400 cursor-pointer">?</span>
                                    </div>
                                </>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-gray-800 text-white text-lg font-semibold py-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Sign up
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="flex justify-between">
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`pin-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value)}
                                    className="w-12 h-12 my-3 text-center border rounded"
                                    required
                                />
                            ))}
                        </div>
                    )}


                    {step === 2 && (
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gray-800 text-white text-lg font-semibold py-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Verify Email
                        </button>)
                    }

                    {/* Error and success message */}
                    {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
                    {success && (
                        <p className="mt-4 text-green-500 text-center">
                            {success}
                        </p>
                    )}

                    <p className="mt-4 text-center text-sm text-gray-600">
                        By clicking Sign up, I agree to {" "}
                        <a href="/" className="text-blue-500 hover:underline">Terms</a> and{' '}
                        <a href="/" className="text-blue-500 hover:underline">Privacy Policy</a>
                    </p>
                    <div className="mt-6 text-center text-sm">
                        Existing user?{' '}
                        <a href="/login" className="text-blue-500 hover:underline">Sign in</a>
                    </div>
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

export default SignupPage;
