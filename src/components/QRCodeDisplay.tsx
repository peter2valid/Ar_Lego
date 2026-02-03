import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
    url: string;
    size?: number;
    label?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
    url,
    size = 200,
    label = "Scan to view in AR",
}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    useEffect(() => {
        QRCode.toDataURL(url, { width: size, margin: 2 }, (err: Error | null | undefined, dataUrl: string) => {
            if (!err) {
                setQrCodeUrl(dataUrl);
            } else {
                console.error("Failed to generate QR code", err);
            }
        });
    }, [url, size]);

    if (!qrCodeUrl) return null;

    return (
        <div className="qr-code-display">
            <div className="qr-code-display__image">
                <img src={qrCodeUrl} alt="QR Code" width={size} height={size} />
            </div>
            {label && <p className="qr-code-display__label">{label}</p>}

            <style>{`
        .qr-code-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .qr-code-display__image img {
          display: block;
          border-radius: 4px;
        }

        .qr-code-display__label {
          color: #333;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
        }
      `}</style>
        </div>
    );
};

export default QRCodeDisplay;
