import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Alert = ({
    type = 'info',
    title,
    children,
    onClose,
    dismissible = true,
    icon,
    className = '',
    ...props
}) => {
    // Base styles
    const baseStyles = 'relative flex items-start gap-3 p-4 rounded-lg border transition-all duration-200';

    // Type configurations
    const typeConfig = {
        success: {
            container: 'bg-[#E8F5ED] border-[#2D8A4E] text-[#1E6A38]',
            icon: <CheckCircle size={20} className="flex-shrink-0" />,
            iconColor: 'text-[#2D8A4E]',
        },
        error: {
            container: 'bg-[#FFF5F5] border-[#C93B3B] text-[#9D2B2B]',
            icon: <XCircle size={20} className="flex-shrink-0" />,
            iconColor: 'text-[#C93B3B]',
        },
        warning: {
            container: 'bg-[#FFF9E6] border-[#D4920A] text-[#A47208]',
            icon: <AlertTriangle size={20} className="flex-shrink-0" />,
            iconColor: 'text-[#D4920A]',
        },
        info: {
            container: 'bg-[#EBF5FF] border-[#3B82C9] text-[#2A62A1]',
            icon: <Info size={20} className="flex-shrink-0" />,
            iconColor: 'text-[#3B82C9]',
        },
    };

    const config = typeConfig[type] || typeConfig.info;

    // Combine classes
    const alertClasses = [
        baseStyles,
        config.container,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={alertClasses} role="alert" {...props}>
            {/* Icon */}
            <div className={config.iconColor}>
                {icon || config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {title && (
                    <div className="font-semibold mb-1">
                        {title}
                    </div>
                )}
                <div className="text-sm">
                    {children}
                </div>
            </div>

            {/* Close Button */}
            {dismissible && onClose && (
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 focus:outline-none transition-opacity`}
                    aria-label="Close alert"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};

// Demo Component
const AlertDemo = () => {
    const [alerts, setAlerts] = React.useState({
        success: true,
        error: true,
        warning: true,
        info: true,
    });

    const handleClose = (type) => {
        setAlerts({ ...alerts, [type]: false });
    };

    const handleResetAll = () => {
        setAlerts({
            success: true,
            error: true,
            warning: true,
            info: true,
        });
    };

    return (
        <div className="min-h-screen bg-[#FEF3EB] p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Basic Alerts */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Basic Alerts</h2>
                    <div className="space-y-4">
                        {alerts.success && (
                            <Alert
                                type="success"
                                onClose={() => handleClose('success')}
                            >
                                Song added to queue successfully!
                            </Alert>
                        )}

                        {alerts.error && (
                            <Alert
                                type="error"
                                onClose={() => handleClose('error')}
                            >
                                Failed to add song. Please try again.
                            </Alert>
                        )}

                        {alerts.warning && (
                            <Alert
                                type="warning"
                                onClose={() => handleClose('warning')}
                            >
                                Queue is almost full. Only 3 slots remaining.
                            </Alert>
                        )}

                        {alerts.info && (
                            <Alert
                                type="info"
                                onClose={() => handleClose('info')}
                            >
                                Scan the QR code at your table to request songs.
                            </Alert>
                        )}

                        {!Object.values(alerts).some(v => v) && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">All alerts have been dismissed</p>
                                <button
                                    onClick={handleResetAll}
                                    className="px-4 py-2 bg-[#E07A3D] text-white rounded-lg hover:bg-[#C4612A]"
                                >
                                    Reset All Alerts
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts with Titles */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Alerts with Titles</h2>
                    <div className="space-y-4">
                        <Alert type="success" title="Success!">
                            Your account has been created successfully. You can now start adding songs to the queue.
                        </Alert>

                        <Alert type="error" title="Authentication Error">
                            Your session has expired. Please log in again to continue.
                        </Alert>

                        <Alert type="warning" title="Queue Limit Reached">
                            You've reached the maximum number of songs per user. Please wait for your current songs to play.
                        </Alert>

                        <Alert type="info" title="New Feature Available">
                            You can now save your favorite songs to create quick playlists!
                        </Alert>
                    </div>
                </div>

                {/* Non-dismissible Alerts */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Non-dismissible Alerts</h2>
                    <div className="space-y-4">
                        <Alert type="info" dismissible={false}>
                            This alert cannot be dismissed. Important system message.
                        </Alert>

                        <Alert type="warning" title="Maintenance Notice" dismissible={false}>
                            The system will be under maintenance from 2 AM to 4 AM EST.
                        </Alert>
                    </div>
                </div>

                {/* Real-world Form Examples */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Form Validation Examples</h2>

                    {/* Login Form with Error */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-[#3D2B1F]">Login Form Error</h3>
                        <div className="max-w-md space-y-3">
                            <Alert type="error">
                                Invalid email or password. Please try again.
                            </Alert>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E07A3D]"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E07A3D]"
                            />
                            <button className="w-full px-4 py-2 bg-[#E07A3D] text-white rounded-lg hover:bg-[#C4612A]">
                                Sign In
                            </button>
                        </div>
                    </div>

                    {/* Registration Success */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-[#3D2B1F]">Registration Success</h3>
                        <div className="max-w-md">
                            <Alert type="success" title="Welcome!">
                                Your account has been created. Redirecting to dashboard...
                            </Alert>
                        </div>
                    </div>

                    {/* Password Reset Warning */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-[#3D2B1F]">Password Reset Warning</h3>
                        <div className="max-w-md">
                            <Alert type="warning" title="Security Notice">
                                For your security, please change your password after your first login.
                            </Alert>
                        </div>
                    </div>
                </div>

                {/* Song Request Alerts */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Song Request Alerts</h2>
                    <div className="space-y-4">
                        <Alert type="success">
                            "Shape of You" by Ed Sheeran has been added to the queue. Position: #24
                        </Alert>

                        <Alert type="info">
                            Your song "Tum Hi Ho" is now playing at Table 5!
                        </Alert>

                        <Alert type="warning">
                            This song is already in the queue. Please choose another song.
                        </Alert>

                        <Alert type="error">
                            Unable to add song. The queue is currently full.
                        </Alert>
                    </div>
                </div>

                {/* Compact Alerts */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Compact Alerts (No Icons)</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-[#2D8A4E] bg-[#E8F5ED] px-3 py-2 rounded">
                            <CheckCircle size={16} />
                            <span>Changes saved successfully</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#C93B3B] bg-[#FFF5F5] px-3 py-2 rounded">
                            <XCircle size={16} />
                            <span>Failed to save changes</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#D4920A] bg-[#FFF9E6] px-3 py-2 rounded">
                            <AlertTriangle size={16} />
                            <span>Unsaved changes</span>
                        </div>
                    </div>
                </div>

                {/* Dark Mode Preview */}
                <div className="bg-[#1A1512] rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-white">Dark Mode Preview</h2>
                    <div className="space-y-4">
                        <Alert type="success">
                            Song added successfully to your playlist!
                        </Alert>

                        <Alert type="error">
                            Connection lost. Please check your internet.
                        </Alert>

                        <Alert type="info" title="Tip">
                            You can search songs by artist, title, or album name.
                        </Alert>
                    </div>
                </div>

                {/* Usage Code */}
                <div className="bg-[#3D2B1F] text-white rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
                    <div className="bg-[#2A2320] p-4 rounded font-mono text-sm overflow-x-auto">
                        <pre className="text-green-400">{`// Basic alert
<Alert type="success">
  Operation completed successfully!
</Alert>

// Alert with title
<Alert type="error" title="Error">
  Something went wrong. Please try again.
</Alert>

// Dismissible alert
<Alert 
  type="warning" 
  onClose={handleClose}
>
  This is a warning message.
</Alert>

// Non-dismissible alert
<Alert type="info" dismissible={false}>
  This cannot be closed.
</Alert>

// Alert with custom icon
<Alert 
  type="success" 
  icon={<CustomIcon />}
>
  Custom icon alert
</Alert>

// In your component
const [showAlert, setShowAlert] = useState(true);

{showAlert && (
  <Alert 
    type="success" 
    onClose={() => setShowAlert(false)}
  >
    Success message!
  </Alert>
)}`}</pre>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AlertDemo;