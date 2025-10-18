import React from 'react';
import { Application } from '../../types';
import { CheckCircle, Clock, RotateCw, XCircle, FileCheck } from 'lucide-react';

interface ApplicationStatusProps {
  application: Application;
}

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ application }) => {
  const getStatusDetails = () => {
    switch (application.status) {
      case 'draft':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <FileCheck size={18} className="text-gray-500" />,
          label: 'Draft',
          description: 'Your application has been saved as a draft.',
          actionLabel: 'Continue Application',
        };
      case 'submitted':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock size={18} className="text-blue-500" />,
          label: 'Submitted',
          description: 'Your application has been submitted successfully.',
          actionLabel: 'Track Status',
        };
      case 'under-review':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <RotateCw size={18} className="text-yellow-500" />,
          label: 'Under Review',
          description: 'Your application is currently being reviewed.',
          actionLabel: 'View Details',
        };
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle size={18} className="text-green-500" />,
          label: 'Approved',
          description: 'Congratulations! Your application has been approved.',
          actionLabel: 'View Benefits',
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle size={18} className="text-red-500" />,
          label: 'Rejected',
          description: 'Your application was not approved. Click for more details.',
          actionLabel: 'View Reason',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock size={18} className="text-gray-500" />,
          label: 'Processing',
          description: 'Your application is being processed.',
          actionLabel: 'View Details',
        };
    }
  };

  const { color, icon, label, description, actionLabel } = getStatusDetails();

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`${color} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center">
          {icon}
          <span className="ml-2 font-medium">{label}</span>
        </div>
        <span className="text-xs">
          Submitted: {new Date(application.submissionDate).toLocaleDateString()}
        </span>
      </div>
      <div className="p-4 bg-white">
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Application ID</div>
            <div className="text-sm font-medium">{application.id}</div>
          </div>
          <button className="btn btn-outline text-xs px-3 py-1">{actionLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;