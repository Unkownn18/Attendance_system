import React from 'react';
import { Line } from 'rc-progress';
import { TailSpin } from 'react-loader-spinner';
import './LoadingBar.css'; // Optional: for custom styles

const LoadingBar = ({ percentage }) => {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <TailSpin
                    height="80"
                    width="80"
                    color="#4fa94d"
                    ariaLabel="loading"
                />
                <div className="loading-percentage">
                    <p>Loading...</p>
                    <Line
                        percent={percentage}
                        strokeWidth="4"
                        strokeColor="#4fa94d"
                        trailWidth="4"
                        trailColor="#d6d6d6"
                        className="progress-bar"
                    />
                    <p>{percentage}%</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingBar;
