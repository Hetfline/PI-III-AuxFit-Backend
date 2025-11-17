const { supabaseAdmin } = require('../config/supabase');

class PerfilAlimentarController {
  
  // Obter o perfil alimentar do usuário logado
  async get(req, res) {
    try {
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('perfil_alimentar')
        .select('*')
        .eq('usuario_fk', usuario_fk)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found, o que é ok
        return res.status(400).json({ error: error.message });
      }
      
      if (!data) {
          return res.status(200).json(null); // Retorna nulo se não houver perfil
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar ou ATUALIZAR o perfil alimentar do usuário
  async createOrUpdate(req, res) {
    try {
      const usuario_fk = req.user.id;
      
      const { 
        restricoes_alimentares,
        alimentos_preferidos,
        alimentos_evitados,
        vegetariano,
        vegano,
        refeicoes_dia,
        problemas_saude 
      } = req.body;

      // Usamos 'upsert' para criar ou atualizar com base na 'usuario_fk'
      const { data, error } = await supabaseAdmin
        .from('perfil_alimentar')
        .upsert({ 
          usuario_fk, // A chave de conflito
          restricoes_alimentares,
          alimentos_preferidos,
          alimentos_evitados,
          vegetariano,
          vegano,
          refeicoes_dia,
          problemas_saude 
        }, { 
          onConflict: 'usuario_fk' // Diz ao Supabase para atualizar se 'usuario_fk' já existir
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

module.exports = new PerfilAlimentarController();