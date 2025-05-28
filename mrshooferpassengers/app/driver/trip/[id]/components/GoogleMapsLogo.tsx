import React from "react";

interface GoogleMapsLogoProps {
    size?: number;
    className?: string;
}

const GoogleMapsLogo: React.FC<GoogleMapsLogoProps> = ({ size = 40, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 230.92 331"
        width={size}
        height={size}
        className={className}
        aria-label="Google Maps logo"
    >
        <title>Google Maps logo - Brandlogos.net</title>
        <path d="M418.92,223.86a115.69,115.69,0,0,0-123.33,35.86l54.55,45.86Z" transform="translate(-268.54 -218.5)" style={{ fill: '#1a73e8' }} />
        <path d="M295.58,259.72a115.07,115.07,0,0,0-27,74.21c0,21.69,4.31,39.33,11.43,55.07l70.16-83.42Z" transform="translate(-268.54 -218.5)" style={{ fill: '#ea4335' }} />
        <path d="M384,289.83a44.17,44.17,0,0,1,33.71,72.71l68.72-81.72a115.52,115.52,0,0,0-67.61-56.9l-68.66,81.72A44,44,0,0,1,384,289.83" transform="translate(-268.54 -218.5)" style={{ fill: '#4285f4' }} />
        <path d="M384,378.15a44.14,44.14,0,0,1-33.84-72.51L280,389.06c12,26.59,31.94,47.95,52.46,74.86l85.31-101.38A44.11,44.11,0,0,1,384,378.15" transform="translate(-268.54 -218.5)" style={{ fill: '#fbbc04' }} />
        <path d="M416,491.56c38.54-60.23,83.42-87.6,83.42-157.63a115,115,0,0,0-13-53.24l-154,183.24c6.53,8.56,13.13,17.64,19.53,27.7,23.39,36.19,16.92,57.88,32,57.88s8.62-21.75,32-57.94" transform="translate(-268.54 -218.5)" style={{ fill: '#34a853' }} />
    </svg>
);

export default GoogleMapsLogo;
