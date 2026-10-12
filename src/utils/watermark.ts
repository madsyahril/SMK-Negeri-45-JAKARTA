import { AttendanceType } from '../types';
import { formatCoordinates } from './geo';

export interface WatermarkData {
  studentName: string;
  nis: string;
  attendanceType: AttendanceType;
  dateStr: string; // e.g. "12 Okt 2026"
  timeStr: string; // e.g. "07:15:30 WIB"
  latitude?: number;
  longitude?: number;
  accuracy?: number; // meters
  industryName?: string;
}

/**
 * Draws an official SI-PKL SMART watermark onto an image using an off-screen HTML5 Canvas.
 * Generates both the original and watermarked data URLs.
 */
export async function applyWatermark(
  imageSource: string | HTMLCanvasElement,
  data: WatermarkData
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = img.width || 1280;
      const height = img.height || 720;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Gagal mendapatkan canvas context'));
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Watermark dimensions
      const bannerHeight = Math.max(120, height * 0.22);
      const padding = 20;

      // Dark gradient overlay at the bottom for high contrast
      const gradient = ctx.createLinearGradient(0, height - bannerHeight - 40, 0, height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.85)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - bannerHeight - 40, width, bannerHeight + 40);

      // Top security stamp band (small line)
      ctx.fillStyle = data.attendanceType === 'DATANG' ? '#0D9488' : '#F59E0B';
      ctx.fillRect(0, height - bannerHeight - 2, width, 4);

      // Typography settings
      const baseFontSize = Math.max(14, Math.round(width * 0.022));
      const titleFontSize = Math.max(18, Math.round(width * 0.03));
      
      // Left side: Student & Attendance Info
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${titleFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText(
        `SI-PKL SMART • ${data.attendanceType === 'DATANG' ? 'PRESENSI DATANG' : 'PRESENSI PULANG'}`,
        padding,
        height - bannerHeight + titleFontSize
      );

      ctx.fillStyle = '#E2E8F0';
      ctx.font = `600 ${baseFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText(
        `${data.studentName} (NIS: ${data.nis})`,
        padding,
        height - bannerHeight + titleFontSize + baseFontSize * 1.5
      );

      if (data.industryName) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = `400 ${baseFontSize * 0.88}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.fillText(
          `DUDI: ${data.industryName}`,
          padding,
          height - bannerHeight + titleFontSize + baseFontSize * 2.8
        );
      }

      // Coordinates & Accuracy
      ctx.fillStyle = '#CBD5E1';
      ctx.font = `500 ${baseFontSize * 0.85}px 'JetBrains Mono', monospace`;
      const coordsText = `GPS: ${formatCoordinates(data.latitude, data.longitude)} | Akurasi: ±${Math.round(data.accuracy || 0)}m`;
      ctx.fillText(
        coordsText,
        padding,
        height - bannerHeight + titleFontSize + baseFontSize * 4.1
      );

      // Right side / Timestamp block
      ctx.textAlign = 'right';
      ctx.fillStyle = '#F8FAFC';
      ctx.font = `bold ${titleFontSize * 1.1}px 'JetBrains Mono', monospace`;
      ctx.fillText(data.timeStr, width - padding, height - bannerHeight + titleFontSize);

      ctx.fillStyle = '#38BDF8';
      ctx.font = `600 ${baseFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText(data.dateStr, width - padding, height - bannerHeight + titleFontSize + baseFontSize * 1.5);

      ctx.fillStyle = '#94A3B8';
      ctx.font = `400 ${baseFontSize * 0.75}px 'JetBrains Mono', monospace`;
      ctx.fillText('SERVER VERIFIED (WIB)', width - padding, height - bannerHeight + titleFontSize + baseFontSize * 2.8);

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };

    img.onerror = () => {
      reject(new Error('Gagal memproses gambar untuk watermark'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = imageSource.toDataURL('image/jpeg', 0.9);
    }
  });
}
