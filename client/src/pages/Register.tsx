import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Register: React.FC = () => {
    const { authState, registerUser, googleLogin, clearErrors } = useContext(AuthContext);
    const { isAuthenticated, error } = authState;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<RegisterFormData>();

    const password = watch('password');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }

        if (error) {
            setServerError(error);
            toast.error(error);
            clearErrors();
        }
    }, [isAuthenticated, error, navigate, clearErrors]);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true);
            setServerError(null);
            
            // Make sure passwords match before submitting
            if (data.password !== data.confirmPassword) {
                toast.error("Passwords don't match");
                setIsLoading(false);
                return;
            }
            
            console.log('Submitting registration data:', {
                username: data.username,
                email: data.email,
                passwordProvided: !!data.password
            });
                
            await registerUser(data.username, data.email, data.password);
            toast.success("Registration successful! Redirecting to dashboard...");
        } catch (err) {
            console.error("Registration error:", err);
            const errorMsg = err instanceof Error ? err.message : "Registration failed. Please try again.";
            setServerError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setIsLoading(true);
            // Check if we have the credential
            if (!credentialResponse.credential) {
                throw new Error('No credential received from Google');
            }
            
            console.log('Google login attempt with token:', credentialResponse.credential.substring(0, 20) + '...');
            await googleLogin(credentialResponse.credential);
            toast.success("Google login successful!");
        } catch (err) {
            console.error("Google login error:", err);
            toast.error("Google login failed. Please try again.");
            setServerError("Google login failed. You can also register with email and password.");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to test the API connectivity
    const testApiConnection = async () => {
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${API_URL}/auth/public-test`);
            toast.success('API connection successful!');
            console.log('API test response:', response.data);
        } catch (err) {
            toast.error('API connection failed!');
            console.error('API test error:', err);
            setServerError('Could not connect to the API. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
                
                {/* Test API button - for debugging only */}
                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={testApiConnection}
                        className="text-xs text-blue-500 hover:text-blue-700"
                    >
                        Test API Connection
                    </button>
                </div>
                
                {serverError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="form-input mt-1"
                            {...register('username', {
                                required: 'Username is required',
                                minLength: {
                                    value: 3,
                                    message: 'Username must be at least 3 characters'
                                }
                            })}
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-input mt-1"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-input mt-1"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input mt-1"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value => value === password || 'Passwords do not match'
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-4">
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                            Login
                        </Link>
                    </p>
                </div>

                <div className="mt-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.error('Google Sign In was not successful');
                                toast.error('Google login failed. Please try again.');
                                setServerError("Google login configuration error. Please use email registration.");
                            }}
                            useOneTap
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;