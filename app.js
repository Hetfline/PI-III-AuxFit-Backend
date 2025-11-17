const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Rotas de Autenticação
const authRoutes = require('./routes/authRoutes');

// --- ADICIONE TODAS AS NOVAS ROTAS ---
const alimentoRoutes = require('./routes/alimentoRoutes');
const refeicaoRoutes = require('./routes/refeicaoRoutes');
const exercicioRoutes = require('./routes/exercicioRoutes');
const treinoRoutes = require('./routes/treinoRoutes');
const progressoRoutes = require('./routes/progressoRoutes');
const perfilAlimentarRoutes = require('./routes/perfilAlimentarRoutes');
const perfilTreinoRoutes = require('./routes/perfilTreinoRoutes');
const refeicaoItemRoutes = require('./routes/refeicaoItemRoutes');
const treinoExercicioRoutes = require('./routes/treinoExercicioRoutes');
// ------------------------------------

const { supabase } = require('./config/supabase');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ charset: 'utf-8' })); 
app.use(express.urlencoded({ extended: true, charset: 'utf-8' })); 

// --- REGISTRE AS ROTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/alimentos', alimentoRoutes);
app.use('/api/refeicoes', refeicaoRoutes);
app.use('/api/exercicios', exercicioRoutes);
app.use('/api/treinos', treinoRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/perfil-alimentar', perfilAlimentarRoutes);
app.use('/api/perfil-treino', perfilTreinoRoutes);
app.use('/api/refeicao-itens', refeicaoItemRoutes);
app.use('/api/treino-exercicios', treinoExercicioRoutes);
// -------------------------

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  // ... (seu código de log do usuário inicial)
});

module.exports = app;