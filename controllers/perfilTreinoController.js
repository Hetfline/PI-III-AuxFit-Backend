const { supabaseAdmin } = require('../config/supabase');

class PerfilTreinoController {
  
  // Obter o perfil de treino do usuário logado
  async get(req, res) {
    try {
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('perfil_treino')
        .select('*')
        .eq('usuario_fk', usuario_fk)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(400).json({ error: error.message });
      }
      
      if (!data) {
          return res.status(200).json(null);
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar ou ATUALIZAR o perfil de treino (CORRIGIDO PARA O NOVO SCHEMA)
  async createOrUpdate(req, res) {
    try {
      const usuario_fk = req.user.id;
      
      // Extrai os campos EXATOS que o Frontend (SummaryScreen) está enviando
      const { 
        nivel_experiencia,
        dias_por_semana,
        equipamentos_disponiveis,
        limitacoes_lesoes,
        tempo_disponivel_minutos,
        estilo_treino,
        grupos_musculares_foco,
        observacoes_adicionais
      } = req.body;

      console.log("Recebendo dados perfil treino:", req.body); // Log para debug

      const { data, error } = await supabaseAdmin
        .from('perfil_treino')
        .upsert({ 
          usuario_fk,
          nivel_experiencia,
          dias_por_semana,
          equipamentos_disponiveis,
          limitacoes_lesoes,
          tempo_disponivel_minutos,
          estilo_treino,
          grupos_musculares_foco,
          observacoes_adicionais
        }, { 
          onConflict: 'usuario_fk' // Requer a constraint UNIQUE criada anteriormente
        })
        .select()
        .single();

      if (error) {
          console.error("Erro Supabase:", error);
          return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Erro Controller:", error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new PerfilTreinoController();