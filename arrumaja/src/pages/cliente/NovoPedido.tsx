import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useServices } from '../../hooks/useServices';
import { useOrders } from '../../hooks/useOrders';
import { ESTADOS_BR } from '../../lib/constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { GenderPreference } from '../../types';

const STEPS = ['Serviço', 'Descrição', 'Endereço', 'Confirmação'];

export function NovoPedido() {
  const { user } = useAuthContext();
  const { services, loading: svcLoading } = useServices();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [generoPreferencia, setGeneroPreferencia] = useState<GenderPreference>('qualquer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canNext = () => {
    if (step === 0) return !!serviceId;
    if (step === 1) return !!titulo && !!descricao;
    if (step === 2) return !!endereco && !!cidade && !!estado;
    return true;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError('');

    const { error } = await createOrder({
      cliente_id: user.id,
      service_id: serviceId,
      titulo,
      descricao,
      endereco,
      cidade,
      estado,
      genero_preferencia: generoPreferencia,
    });

    if (error) {
      setError('Erro ao criar pedido. Tente novamente.');
      setSubmitting(false);
    } else {
      navigate('/cliente');
    }
  }

  if (svcLoading) return <LoadingSpinner />;

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedir Serviço</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-5">{error}</div>}

        {/* Step 0: Service */}
        {step === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Qual serviço você precisa?</label>
            <div className="grid grid-cols-2 gap-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setServiceId(svc.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    serviceId === svc.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{svc.nome}</span>
                </button>
              ))}
            </div>

            {user?.genero === 'feminino' && (
              <div className="mt-4 p-4 bg-pink-50 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={generoPreferencia === 'feminino'}
                    onChange={(e) => setGeneroPreferencia(e.target.checked ? 'feminino' : 'qualquer')}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Prefiro profissionais mulheres</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Description */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">Título do serviço</label>
              <input id="titulo" type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ex: Troca de tomada na cozinha" />
            </div>
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descreva o serviço</label>
              <textarea id="descricao" required rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Detalhes do que você precisa..." />
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input id="endereco" type="text" required value={endereco} onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Rua, número, bairro" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input id="cidade" type="text" required value={cidade} onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select id="estado" required value={estado} onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  <option value="">UF</option>
                  {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Confirme seu pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Serviço</span>
                <span className="font-medium">{selectedService?.nome}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Título</span>
                <span className="font-medium">{titulo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Local</span>
                <span className="font-medium">{cidade}, {estado}</span>
              </div>
              {generoPreferencia === 'feminino' && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Preferência</span>
                  <span className="font-medium text-pink-600">Só mulheres</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Após criar o pedido, profissionais qualificados enviarão propostas com estimativa de valor.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          ) : <div />}

          {step < 3 ? (
            <button type="button" disabled={!canNext()} onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 disabled:opacity-50">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-1 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 disabled:opacity-50">
              {submitting ? 'Criando...' : 'Criar Pedido'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
