export interface ParsedQr {
  vpa: string;
  payeeName: string;
  raw: string;
}

export function parseUpiQr(raw: string): ParsedQr | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'upi:') return null;
    const vpa = url.searchParams.get('pa');
    const payeeName = url.searchParams.get('pn') ?? '';
    if (!vpa) return null;
    return { vpa, payeeName: decodeURIComponent(payeeName), raw };
  } catch {
    return null;
  }
}

export function buildUpiUrl(vpa: string, payeeName: string, amount: string): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amount,
    cu: 'INR',
    tn: 'Payment via UPI Pay Log',
    tr: 'TR' + Date.now().toString(),
  });
  return `upi://pay?${params.toString()}`;
}

export function buildWhatsAppUrl(phone: string, payeeName: string, vpa: string, amount: string): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const message = `\u{1F4B8} ₹${amount} to ${payeeName}\n\u{1F4C5} ${dateStr}, ${timeStr}\n\u{1F3F7}️ ${vpa}`;
  return `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
}
