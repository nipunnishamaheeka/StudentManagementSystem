import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

interface LoginFormData {
    email: string;
    password: string;
}

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Login: React.FC = () => {
    const { authState, loginUser, registerUser, googleLogin, clearErrors } = useContext(AuthContext);
    const { isAuthenticated, error } = authState;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isRegisterForm, setIsRegisterForm] = useState(false);

    const {
        register: loginRegister,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors }
    } = useForm<LoginFormData>();

    const {
        register: registerFormRegister,
        handleSubmit: handleRegisterSubmit,
        formState: { errors: registerErrors },
        watch
    } = useForm<RegisterFormData>();

    const password = watch('password');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }

        if (error) {
            toast.error(error);
            clearErrors();
        }
    }, [isAuthenticated, error, navigate, clearErrors]);

    const onLoginSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        await loginUser(data.email, data.password);
        setIsLoading(false);
    };

    const onRegisterSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        await registerUser(data.username, data.email, data.password);
        setIsLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        await googleLogin(credentialResponse.credential);
        setIsLoading(false);
    };

    const toggleForm = () => {
        setIsRegisterForm(!isRegisterForm);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {isRegisterForm ? 'Register' : 'Login'}
                </h2>

                {isRegisterForm ? (
                    <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="form-input mt-1"
                                {...registerFormRegister('username', {
                                    required: 'Username is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Username must be at least 3 characters'
                                    }
                                })}
                            />
                            {registerErrors.username && (
                                <p className="mt-1 text-sm text-red-600">{registerErrors.username.message}</p>
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
                                {...registerFormRegister('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {registerErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
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
                                {...registerFormRegister('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                            />
                            {registerErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
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
                                {...registerFormRegister('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value => value === password || 'Passwords do not match'
                                })}
                            />
                            {registerErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message}</p>
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
                ) : (
                    <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="form-input mt-1"
                                {...loginRegister('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {loginErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
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
                                {...loginRegister('password', {
                                    required: 'Password is required'
                                })}
                            />
                            {loginErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn btn-primary"
                        >
                            {isLoading ? 'Loading...' : 'Login'}
                        </button>
                    </form>
                )}

                <div className="mt-4">
                    <p className="text-center text-sm text-gray-600">
                        {isRegisterForm ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            type="button"
                            onClick={toggleForm}
                            className="text-indigo-600 hover:text-indigo-500"
                        >
                            {isRegisterForm ? 'Login' : 'Register'}
                        </button>
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
                                toast.error('Google login failed. Please try again.');
                            }}
                            useOneTap
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;