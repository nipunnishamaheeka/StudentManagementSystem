import React, { createContext, useReducer, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { AuthState, AuthContextType, User } from '../types';
import * as api from '../api';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define action types
type AuthAction =
    | { type: 'REGISTER_SUCCESS'; payload: { token: string } }
    | { type: 'LOGIN_SUCCESS'; payload: { token: string } }
    | { type: 'GOOGLE_LOGIN_SUCCESS'; payload: { token: string } }
    | { type: 'USER_LOADED'; payload: User }
    | { type: 'AUTH_ERROR' }
    | { type: 'LOGIN_FAIL'; payload: string }
    | { type: 'REGISTER_FAIL'; payload: string }
    | { type: 'GOOGLE_LOGIN_FAIL'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERRORS' };

// Initial state
const initialState: AuthState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
    user: null,
    error: null
};

// Create context
export const AuthContext = createContext<AuthContextType>({
    authState: {
        token: null,
        isAuthenticated: false,
        loading: true,
        user: null,
        error: null
    },
    registerUser: async () => {},
    loginUser: async () => {},
    googleLogin: async () => {},
    loadUser: async () => {},
    logout: () => {},
    clearErrors: () => {}
});

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
        case 'GOOGLE_LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'REGISTER_FAIL':
        case 'GOOGLE_LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.type === 'LOGOUT' ? null : 
                       (action.type === 'AUTH_ERROR' ? 'Authentication error' : action.payload)
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// Custom ToastContainer with explicit props instead of defaultProps
const ToastContainer = () => {
    return (
        <ReactToastifyContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    );
};

// Update the API_URL to use relative paths in development
const API_URL = process.env.NODE_ENV === 'production'
  ? (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '')
  : '/api';

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Helper function to check if error is an Axios error
    const isAxiosError = (error: unknown): error is AxiosError => {
        return axios.isAxiosError(error);
    };

    // Get error message from various error types
    const getErrorMessage = (err: unknown): string => {
        if (isAxiosError(err)) {
            const responseData = err.response?.data;
            // Safely check if responseData is an object with an error property
            if (responseData && typeof responseData === 'object' && 'error' in responseData) {
                // Use type assertion since we've already checked the property exists
                return String((responseData as any).error);
            }
            return err.message || 'An error occurred';
        }
        return err instanceof Error ? err.message : 'An unknown error occurred';
    };

    // Load user data if token exists
    useEffect(() => {
        const loadUserData = async () => {
            if (localStorage.token) {
                try {
                    const userData = await api.loadUser();
                    dispatch({ type: 'USER_LOADED', payload: userData });
                } catch (err) {
                    dispatch({ type: 'AUTH_ERROR' });
                }
            } else {
                dispatch({ type: 'AUTH_ERROR' });
            }
        };

        loadUserData();
    }, []);

    // Register user
    const registerUser = async (username: string, email: string, password: string) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            // Make sure credentials are included
            withCredentials: true
        };

        try {
            const url = `${API_URL}/auth/register`;
            console.log('Sending registration request to:', url);
            
            const res = await axios.post(
                url,
                { username, email, password },
                config
            );
            
            console.log('Registration successful:', res.data);
            
            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });
            
            loadUser();
        } catch (err) { // Removed type annotation
            console.error('Registration error:', err);
            
            const errorMessage = getErrorMessage(err);
                
            dispatch({
                type: 'REGISTER_FAIL',
                payload: errorMessage
            });
            
            throw err;
        }
    };

    // Login user - update to use withCredentials
    const loginUser = async (email: string, password: string) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        };

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password }, config);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
            await loadUser();
        } catch (err) { // Removed type annotation
            const errorMessage = getErrorMessage(err);
            dispatch({ type: 'LOGIN_FAIL', payload: errorMessage });
            throw err;
        }
    };

    // Google login - update to use withCredentials
    const googleLogin = async (tokenId: string) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        };

        try {
            const res = await axios.post(
                `${API_URL}/auth/google`,
                { tokenId },
                config
            );

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });

            loadUser();
        } catch (err) { // Removed type annotation
            console.error('Google login error:', err);
            
            const errorMessage = getErrorMessage(err);
            
            dispatch({
                type: 'LOGIN_FAIL',
                payload: errorMessage
            });
            
            throw err;
        }
    };

    // Load user
    const loadUser = async () => {
        try {
            const userData = await api.loadUser();
            dispatch({ type: 'USER_LOADED', payload: userData });
        } catch (err) { // Removed type annotation
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    // Logout
    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    // Clear errors
    const clearErrors = () => {
        dispatch({ type: 'CLEAR_ERRORS' });
    };

    return (
        <AuthContext.Provider
            value={{
                authState: state,
                registerUser,
                loginUser,
                googleLogin,
                loadUser,
                logout,
                clearErrors
            }}
        >
            {children}
            <ToastContainer />
        </AuthContext.Provider>
    );
};