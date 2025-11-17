const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { supabase } = require('./config/supabase');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ charset: 'utf-8' })); // Garantir UTF-8
app.use(express.urlencoded({ extended: true, charset: 'utf-8' })); // Garantir UTF-8

// Rotas
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;

// Servidor com log do primeiro usuário
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔍 Tentando buscar usuários...`);
  
  try {
    // Buscar o primeiro usuário cadastrado no Supabase
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);

    // DEBUG: Mostrar todos os detalhes
    console.log('📊 Resposta completa:', { 
      data: usuarios, 
      error: error,
      count: usuarios ? usuarios.length : 0 
    });

    if (error) {
      console.log('❌ Erro ao buscar usuário:', error.message);
      console.log('🔍 Detalhes do erro:', error);
    } else if (!usuarios || usuarios.length === 0) {
      console.log('⚠️  Nenhum usuário retornado pela query.');
      console.log('💡 Verifique:');
      console.log('   1. Se há usuários na tabela "usuarios" no Supabase');
      console.log('   2. As permissões RLS (Row Level Security) da tabela');
      console.log('   3. Se a SUPABASE_ANON_KEY está correta no .env');
    } else {
      const usuario = usuarios[0];
      console.log(`✅ Primeiro usuário encontrado:`);
      console.log(`   👤 Nome: ${usuario.nome}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🎯 Objetivo: ${usuario.objetivo}`);
      console.log(`   ⚖️  Peso inicial: ${usuario.peso_inicial}kg`);
    }
  } catch (error) {
    console.log('⚠️  Erro inesperado:', error.message);
    console.log('🔍 Stack:', error);
  }
});

module.exports = app;