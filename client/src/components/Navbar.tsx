import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { authState, logout } = useContext(AuthContext);
    const { user } = authState;
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-600 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="text-white font-bold text-xl">
                                Student Management
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user && (
                            <div className="flex items-center">
                                <span className="text-white mr-4">Welcome, {user.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-white"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;