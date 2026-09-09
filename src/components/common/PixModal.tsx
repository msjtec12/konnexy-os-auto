import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTenant } from '../../context/TenantContext';
import { formatCurrency } from '../../lib/formatters';
import { generatePixPayload } from '../../lib/pix';
import { useToast } from '../ui/Toast';
import { Copy, Check, QrCode, ShieldCheck } from 'lucide-react';

export interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title?: string;
  referenceId?: string;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  amount,
  title = 'Pagamento via Pix',
  referenceId,
}) => {
  const { company } = useTenant();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const pixKey = company.pix_key || '12345678000190';
  const merchantName = company.name || 'OFICINA AUTOMOTIVA';
  const merchantCity = company.city || 'SAO PAULO';

  const pixPayload = generatePixPayload({
    pixKey,
    merchantName,
    merchantCity,
    amount,
    txid: referenceId ? referenceId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) : 'PAGAMENTO',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    success('Código Pix Copia e Cola copiado com sucesso!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col items-center text-center">
        {/* Value badge */}
        <div className="mb-4 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 block">Valor a pagar</span>
          <span className="text-2xl font-extrabold">{formatCurrency(amount)}</span>
        </div>

        {/* QR Code container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-card mb-4 flex items-center justify-center">
          <QRCodeSVG
            value={pixPayload}
            size={200}
            level="M"
            includeMargin={true}
            imageSettings={{
              src: "/icon.svg",
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        {/* Info */}
        <div className="text-xs text-slate-500 mb-5 space-y-1">
          <p className="font-semibold text-slate-700">Beneficiário: {company.name}</p>
          <p>Chave Pix: <span className="font-mono font-medium text-slate-800">{pixKey}</span></p>
          <p className="flex items-center justify-center gap-1 text-slate-400 text-[11px] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pagamento instantâneo e seguro via Banco Central
          </p>
        </div>

        {/* Copy paste button */}
        <div className="w-full space-y-2.5">
          <Button
            variant={copied ? 'success' : 'primary'}
            size="lg"
            className="w-full"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          >
            {copied ? 'Código Pix Copiado!' : 'Copiar Código Pix Copia e Cola'}
          </Button>

          <Button variant="ghost" size="md" className="w-full" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
