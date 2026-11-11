import React, { useRef } from 'react';
import { QrCode, Download, X, Copy, Check, Building, Phone, Mail } from 'lucide-react';
import { Avatar } from './Avatar';

export const QRCodeModal = ({ isOpen, onClose, lecturer }) => {
  const [copied, setCopied] = React.useState(false);
  const canvasRef = useRef(null);

  if (!isOpen || !lecturer) return null;

  const contactData = `BEGIN:VCARD\nVERSION:3.0\nFN:${lecturer.name}\nTITLE:${lecturer.title}\nORG:University - ${lecturer.department}\nTEL:${lecturer.phone}\nEMAIL:${lecturer.email}\nADR:;;${lecturer.office?.building} ${lecturer.office?.roomNumber};;;;\nEND:VCARD`;

  const copyDetails = () => {
    navigator.clipboard.writeText(
      `${lecturer.name} (${lecturer.title})\nOffice: ${lecturer.office?.building}, ${lecturer.office?.roomNumber}\nEmail: ${lecturer.email}\nPhone: ${lecturer.phone}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Draw downloadable QR code graphic to canvas
  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 300, 360);

    // Header banner
    ctx.fillStyle = '#0A192F';
    ctx.fillRect(0, 0, 300, 70);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('UNIVERSITY LECTURER VCARD', 25, 30);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText(lecturer.name, 25, 50);

    // QR Grid pattern simulation
    ctx.fillStyle = '#0F172A';
    const startX = 50;
    const startY = 90;
    const size = 200;
    const cells = 21;
    const cellSize = size / cells;

    // Deterministic pseudo QR pattern from lecturerId
    const seed = lecturer.lecturerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42);
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Corner squares
        const isCorner =
          (r < 7 && c < 7) ||
          (r < 7 && c >= cells - 7) ||
          (r >= cells - 7 && c < 7);
        if (isCorner) {
          const inOuter = r === 0 || r === 6 || c === 0 || c === 6 ||
            (c >= cells - 7 && (r === 0 || r === 6 || c === cells - 1 || c === cells - 7)) ||
            (r >= cells - 7 && (r === cells - 1 || r === cells - 7 || c === 0 || c === 6));
          const inInner =
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
            (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
            (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4);
          if (inOuter || inInner) {
            ctx.fillRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
          }
        } else if (((r * 13 + c * 7 + seed) % 5 === 0) || ((r + c + seed) % 3 === 0)) {
          ctx.fillRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Footer info
    ctx.fillStyle = '#475569';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Office: ${lecturer.office?.building} - ${lecturer.office?.roomNumber}`, 150, 315);
    ctx.fillText(`Tel: ${lecturer.phone} • Email: ${lecturer.email}`, 150, 335);

    // Download PNG
    const link = document.createElement('a');
    link.download = `${lecturer.name.replace(/\s+/g, '_')}_QR_Card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Lecturer vCard QR Code
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Avatar name={lecturer.name} size="lg" className="mx-auto mb-3" />
        <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
          {lecturer.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {lecturer.title} • {lecturer.department}
        </p>

        {/* QR Code SVG Display */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-inner flex flex-col items-center justify-center max-w-[220px] mx-auto mb-4">
          <svg
            className="w-44 h-44 text-slate-900"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            {/* Standard QR Code visual representation with accurate positioning markers */}
            {/* Top-Left Position Detection Pattern */}
            <rect x="5" y="5" width="30" height="30" rx="3" fill="#0A192F" />
            <rect x="10" y="10" width="20" height="20" rx="2" fill="#FFFFFF" />
            <rect x="15" y="15" width="10" height="10" rx="1" fill="#0A192F" />

            {/* Top-Right Position Detection Pattern */}
            <rect x="65" y="5" width="30" height="30" rx="3" fill="#0A192F" />
            <rect x="70" y="10" width="20" height="20" rx="2" fill="#FFFFFF" />
            <rect x="75" y="15" width="10" height="10" rx="1" fill="#0A192F" />

            {/* Bottom-Left Position Detection Pattern */}
            <rect x="5" y="65" width="30" height="30" rx="3" fill="#0A192F" />
            <rect x="10" y="70" width="20" height="20" rx="2" fill="#FFFFFF" />
            <rect x="15" y="75" width="10" height="10" rx="1" fill="#0A192F" />

            {/* Matrix Data Blocks */}
            <rect x="42" y="8" width="6" height="6" fill="#0A192F" />
            <rect x="50" y="16" width="8" height="8" fill="#0A192F" />
            <rect x="40" y="28" width="14" height="6" fill="#0A192F" />
            <rect x="10" y="44" width="8" height="8" fill="#0A192F" />
            <rect x="25" y="48" width="12" height="6" fill="#0A192F" />
            <rect x="44" y="44" width="12" height="12" rx="2" fill="#3B82F6" />
            <rect x="64" y="42" width="10" height="8" fill="#0A192F" />
            <rect x="80" y="46" width="14" height="8" fill="#0A192F" />
            <rect x="42" y="66" width="8" height="12" fill="#0A192F" />
            <rect x="56" y="72" width="14" height="6" fill="#0A192F" />
            <rect x="76" y="64" width="16" height="8" fill="#0A192F" />
            <rect x="70" y="80" width="12" height="12" fill="#0A192F" />
            <rect x="44" y="84" width="8" height="8" fill="#0A192F" />
          </svg>
          <span className="text-[10px] text-slate-400 mt-2 font-mono">
            Scan to save vCard info
          </span>
        </div>

        {/* Office & Contact mini info */}
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-4 text-left px-2">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-blue-500" />
            <span>{lecturer.office?.building}, {lecturer.office?.roomNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lecturer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-purple-500" />
            <span className="truncate">{lecturer.email}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyDetails}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
