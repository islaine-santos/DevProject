import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useAuthContext } from '../hooks/AuthContext';
import { ESTADOS_BR } from '../lib/constants';
import type { GenderType } from '../types';

export function CadastroProfissional() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [genero, setGenero] = useState<GenderType>('nao_informado');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthContext();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, { nome, tipo: 'profissional', genero });
    if (error) {
      setError('Erro ao criar conta. Tente novamente.');
      setLoading(false);
    } else {
      navigate('/profissional/verificacao');
    }
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <Wrench className="w-7 h-7" />
            ArrumaJá
          </Link>
          <p className="text-gray-500 mt-2">Cadastro de Profissional</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-5">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input id="nome" type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Seu nome" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="seu@email.com" />
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input id="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="(11) 99999-9999" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Mínimo 6 caracteres" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
            <select value={genero} onChange={(e) => setGenero(e.target.value as GenderType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="nao_informado">Prefiro não informar</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="nao_binario">Não-binário</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input id="cidade" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="">UF</option>
                {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
            {loading ? 'Criando conta...' : 'Criar conta profissional'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Já tem conta? <Link to="/login" className="text-primary-600 hover:underline font-medium">Entrar</Link>
          </p>
          <p className="text-center text-sm text-gray-500">
            É cliente? <Link to="/cadastro/cliente" className="text-primary-600 hover:underline font-medium">Cadastro cliente</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
