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

  // Criar ou ATUALIZAR o perfil de treino do usuário
  async createOrUpdate(req, res) {
    try {
      const usuario_fk = req.user.id;
      
      const { 
        nivel_experiencia,
        frequencia_treino,
        objetivo_treino,
        problemas_saude,
        faz_cardio,
        duracao_treino
      } = req.body;

      const { data, error } = await supabaseAdmin
        .from('perfil_treino')
        .upsert({ 
          usuario_fk,
          nivel_experiencia,
          frequencia_treino,
          objetivo_treino,
          problemas_saude,
          faz_cardio,
          duracao_treino
        }, { 
          onConflict: 'usuario_fk'
        })
        .select()
        .single();

      if (error) {
          console.error(error);
          return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new PerfilTreinoController();