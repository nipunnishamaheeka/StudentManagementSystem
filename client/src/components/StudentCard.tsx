import React from 'react';
import { Link } from 'react-router-dom';
import { Student } from '../types';

interface StudentCardProps {
    student: Student;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: 'Active' | 'Inactive') => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onDelete, onStatusChange }) => {
    const { _id, name, age, image, status } = student;

    const handleStatusChange = () => {
        const newStatus = status === 'Active' ? 'Inactive' : 'Active';
        onStatusChange(_id, newStatus);
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="h-48 overflow-hidden">
                <img
                    src={`http://localhost:5000${image}`}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{name}</h3>
                <p className="text-gray-600 mb-2">Age: {age}</p>
                <div className="flex items-center mb-4">
                    <span className="mr-2">Status:</span>
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
            {status}
          </span>
                </div>
                <div className="flex justify-between mt-4">
                    <Link
                        to={`/edit-student/${_id}`}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={handleStatusChange}
                        className={`px-3 py-1 rounded-md ${
                            status === 'Active'
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {status === 'Active' ? 'Mark Inactive' : 'Mark Active'}
                    </button>
                    <button
                        onClick={() => onDelete(_id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentCard;