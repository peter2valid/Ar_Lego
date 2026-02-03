import React, { ReactNode } from "react";

interface PhoneSimulatorProps {
    children: ReactNode;
    darkMode?: boolean;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
    children,
    darkMode = true,
}) => {
    return (
        <div className={`phone-simulator ${darkMode ? "dark" : "light"}`}>
            <div className="phone-simulator__frame">
                {/* Notch / Dynamic Island */}
                <div className="phone-simulator__notch">
                    <div className="phone-simulator__camera" />
                    <div className="phone-simulator__speaker" />
                </div>

                {/* Side Buttons */}
                <div className="phone-simulator__button phone-simulator__button--volume-up" />
                <div className="phone-simulator__button phone-simulator__button--volume-down" />
                <div className="phone-simulator__button phone-simulator__button--power" />

                {/* Screen Content */}
                <div className="phone-simulator__screen">{children}</div>

                {/* Home Indicator */}
                <div className="phone-simulator__home-bar" />
            </div>

            <style>{`
        .phone-simulator {
          position: relative;
          display: inline-block;
          margin: 0 auto;
        }

        .phone-simulator__frame {
          width: 300px;
          height: 600px;
          border: 12px solid #1a1a1a;
          border-radius: 48px;
          background: #000;
          position: relative;
          box-shadow: 
            0 0 0 1px #333,
            0 20px 40px -10px rgba(0,0,0,0.5),
            inset 0 0 20px rgba(255,255,255,0.05);
          overflow: hidden;
          z-index: 10;
        }

        .dark .phone-simulator__frame {
          border-color: #1a1a1a;
        }

        .phone-simulator__notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 30px;
          background: #000;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .phone-simulator__camera {
          width: 10px;
          height: 10px;
          background: #1a1a1a;
          border-radius: 50%;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.8);
        }

        .phone-simulator__speaker {
          width: 40px;
          height: 4px;
          background: #1a1a1a;
          border-radius: 2px;
        }

        .phone-simulator__button {
          position: absolute;
          background: #2a2a2a;
          border-radius: 2px;
          z-index: 5;
        }

        .phone-simulator__button--volume-up {
          top: 100px;
          left: -14px;
          width: 4px;
          height: 40px;
        }

        .phone-simulator__button--volume-down {
          top: 150px;
          left: -14px;
          width: 4px;
          height: 40px;
        }

        .phone-simulator__button--power {
          top: 120px;
          right: -14px;
          width: 4px;
          height: 60px;
        }

        .phone-simulator__screen {
          width: 100%;
          height: 100%;
          background: #121212;
          border-radius: 36px;
          overflow: hidden;
          position: relative;
        }

        .phone-simulator__home-bar {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          z-index: 20;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default PhoneSimulator;
