import { useState, type FormEvent } from 'react';
import { ShieldCheck, Upload } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useProfessional } from '../../hooks/useProfessional';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { KycStatusBanner } from '../../components/professionals/KycStatusBanner';
import { SeloBadge } from '../../components/professionals/SeloBadge';
import { KYC_STATUS_LABELS } from '../../lib/constants';

export function ProfissionalKyc() {
  const { user } = useAuthContext();
  const { professional, loading, submitKycDocs } = useProfessional(user?.id);
  const [cpfUrl, setCpfUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [comprovanteUrl, setComprovanteUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) return <LoadingSpinner />;

  if (!professional) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Perfil profissional não encontrado.</p>
      </div>
    );
  }

  const canSubmit = professional.kyc_status === 'pendente' || professional.kyc_status === 'reprovado';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (!cpfUrl.trim() || !selfieUrl.trim() || !comprovanteUrl.trim()) {
      setMessage('Preencha todos os campos de documentos.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const { error } = await submitKycDocs({
      cpf: cpfUrl.trim(),
      selfie: selfieUrl.trim(),
      comprovante_residencia: comprovanteUrl.trim(),
    });

    if (error) {
      setMessage('Erro ao enviar documentos. Tente novamente.');
    } else {
      setMessage('Documentos enviados com sucesso! Aguarde a análise.');
      setCpfUrl('');
      setSelfieUrl('');
      setComprovanteUrl('');
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-7 h-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Verificação KYC</h1>
      </div>

      {/* Current status */}
      <div className="mb-6">
        <KycStatusBanner status={professional.kyc_status} />
      </div>

      {/* Current selo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Seu selo atual</h2>
            <SeloBadge selo={professional.selo} />
          </div>
          <div className="text-right">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Status KYC</h2>
            <span className="text-sm font-semibold text-gray-900">
              {KYC_STATUS_LABELS[professional.kyc_status] || professional.kyc_status}
            </span>
          </div>
        </div>
      </div>

      {/* Document upload form */}
      {canSubmit ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Enviar Documentos</h2>
          </div>

          {professional.kyc_status === 'reprovado' && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
              Sua verificação anterior foi reprovada. Por favor, envie os documentos novamente.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                Documento CPF (URL da imagem)
              </label>
              <input
                id="cpf"
                type="url"
                value={cpfUrl}
                onChange={(e) => setCpfUrl(e.target.value)}
                placeholder="https://exemplo.com/meu-cpf.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Foto ou digitalização legível do seu CPF
              </p>
            </div>

            <div>
              <label htmlFor="selfie" className="block text-sm font-medium text-gray-700 mb-1">
                Selfie com documento (URL da imagem)
              </label>
              <input
                id="selfie"
                type="url"
                value={selfieUrl}
                onChange={(e) => setSelfieUrl(e.target.value)}
                placeholder="https://exemplo.com/minha-selfie.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Foto sua segurando o documento ao lado do rosto
              </p>
            </div>

            <div>
              <label htmlFor="comprovante" className="block text-sm font-medium text-gray-700 mb-1">
                Comprovante de residência (URL da imagem)
              </label>
              <input
                id="comprovante"
                type="url"
                value={comprovanteUrl}
                onChange={(e) => setComprovanteUrl(e.target.value)}
                placeholder="https://exemplo.com/comprovante.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Conta de luz, água ou gás dos últimos 3 meses
              </p>
            </div>

            {message && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar para Verificação'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          {professional.kyc_status === 'em_analise' && (
            <p className="text-gray-600">
              Seus documentos estão em análise. Você será notificado quando o resultado estiver disponível.
            </p>
          )}
          {professional.kyc_status === 'aprovado' && (
            <p className="text-green-700">
              Sua verificação foi aprovada! Seu perfil está verificado.
            </p>
          )}
          {professional.kyc_status === 'suspenso' && (
            <p className="text-red-700">
              Sua conta está suspensa. Entre em contato com o suporte para mais informações.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
