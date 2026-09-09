import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { generateWhatsAppLink } from '../../lib/whatsapp';
import { useToast } from '../ui/Toast';
import { MessageSquare, Copy, ExternalLink, Check } from 'lucide-react';

export interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  customerName: string;
  defaultMessage: string;
  title?: string;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  phone,
  customerName,
  defaultMessage,
  title = 'Enviar mensagem pelo WhatsApp',
}) => {
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleOpenWhatsApp = () => {
    const link = generateWhatsAppLink(phone, message);
    window.open(link, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    success('Mensagem copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>Destinatário: <strong className="text-slate-900">{customerName}</strong></span>
          <span className="font-mono text-slate-700">{phone}</span>
        </div>

        <Textarea
          label="Mensagem Pré-preenchida"
          rows={7}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          helperText="Você pode editar o texto antes de enviar para o cliente."
        />

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            variant="whatsapp"
            size="lg"
            className="flex-1"
            onClick={handleOpenWhatsApp}
            leftIcon={<MessageSquare className="w-5 h-5 fill-current" />}
            rightIcon={<ExternalLink className="w-4 h-4" />}
          >
            Abrir WhatsApp
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
