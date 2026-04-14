import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { useOrders } from '../../hooks/useOrders';
import { ESTADOS_BR } from '../../lib/constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function NovoPedido() {
  const { user } = useAuthContext();
  const { categories, loading: catLoading } = useCategories();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const [categoriaId, setCategoriaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSubmitting(true);

    const { error } = await createOrder({
      cliente_id: user.id,
      categoria_id: categoriaId,
      titulo,
      descricao,
      endereco,
      cidade,
      estado,
      valor_estimado: valorEstimado ? parseFloat(valorEstimado) : null,
    });

    if (error) {
      setError('Erro ao criar pedido. Tente novamente.');
      setSubmitting(false);
    } else {
      navigate('/cliente');
    }
  }

  if (catLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Pedido</h1>
      <p className="text-gray-500 mb-8">Descreva o serviço que você precisa</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria do serviço *
          </label>
          <select
            id="categoria"
            required
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Selecione...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            id="titulo"
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Ex: Troca de tomada na cozinha"
          />
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição *
          </label>
          <textarea
            id="descricao"
            required
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Descreva o serviço que você precisa com detalhes..."
          />
        </div>

        <div>
          <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço *
          </label>
          <input
            id="endereco"
            type="text"
            required
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Rua, número, bairro"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              id="cidade"
              type="text"
              required
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              id="estado"
              required
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">UF</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
            Valor estimado (opcional)
          </label>
          <input
            id="valor"
            type="number"
            min="0"
            step="0.01"
            value={valorEstimado}
            onChange={(e) => setValorEstimado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="R$ 0,00"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Criando pedido...' : 'Criar Pedido'}
        </button>
      </form>
    </div>
  );
}
