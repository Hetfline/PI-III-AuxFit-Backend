const { supabaseAdmin } = require('../config/supabase');

class ProgressoController {
  
  // Criar novo registro manualmente (Opcional, pois o getToday já cria)
  async create(req, res) {
    try {
      const { peso, volume_total, agua_ml, data_registro } = req.body;
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .insert([{ 
            usuario_fk, 
            peso, 
            volume_total, 
            agua_ml, 
            data_registro: data_registro || new Date() 
        }])
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  // --- OBRIGATÓRIO PARA O GRÁFICO (GENERAL TAB) ---
  async getAllByUser(req, res) {
    try {
      const usuario_fk = req.user.id;
      
      const { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .select('*')
        .eq('usuario_fk', usuario_fk)
        .order('data_registro', { ascending: false }); // Do mais recente para o mais antigo

      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar registro específico
  async update(req, res) {
    try {
      const { id } = req.params;
      const { peso, volume_total, agua_ml } = req.body;
      
      const { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .update({ peso, volume_total, agua_ml })
        .eq('id', id)
        .eq('usuario_fk', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  // Deletar
  async delete(req, res) {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('progresso_usuario')
            .delete()
            .eq('id', id)
            .eq('usuario_fk', req.user.id);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno' });
    }
  }

  // --- LÓGICA DE HOJE (PARA O HEADER / ÁGUA) ---
  async getToday(req, res) {
    try {
      const usuario_fk = req.user.id;
      const today = new Date().toISOString().split('T')[0];

      // 1. Tenta buscar registro de hoje
      let { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .select('*')
        .eq('usuario_fk', usuario_fk)
        .eq('data_registro', today)
        .maybeSingle();

      if (error) return res.status(400).json({ error: error.message });

      // 2. Se não existe, cria um novo
      if (!data) {
        // Busca o último peso registrado para não começar zerado
        const { data: lastRecord } = await supabaseAdmin
            .from('progresso_usuario')
            .select('peso')
            .eq('usuario_fk', usuario_fk)
            .order('data_registro', { ascending: false })
            .limit(1)
            .maybeSingle();

        const pesoInicial = lastRecord ? lastRecord.peso : 0;

        const { data: newData, error: createError } = await supabaseAdmin
          .from('progresso_usuario')
          .insert([{ 
             usuario_fk, 
             data_registro: today, 
             agua_ml: 0,
             peso: pesoInicial, 
             volume_total: 0
          }])
          .select()
          .single();
        
        if (createError) return res.status(400).json({ error: createError.message });
        data = newData;
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  // Adicionar Água
  async addWater(req, res) {
    try {
      const usuario_fk = req.user.id;
      const { amount } = req.body; 
      const today = new Date().toISOString().split('T')[0];

      // Garante que o registro de hoje existe chamando a lógica interna ou repetindo query
      // Por segurança, vamos buscar direto
      let { data: current } = await supabaseAdmin
        .from('progresso_usuario')
        .select('id, agua_ml')
        .eq('usuario_fk', usuario_fk)
        .eq('data_registro', today)
        .maybeSingle();

      if (!current) {
         // Cria se não existir (fallback)
         const { data: newItem } = await supabaseAdmin
          .from('progresso_usuario')
          .insert([{ usuario_fk, data_registro: today, agua_ml: 0 }])
          .select()
          .single();
         current = newItem;
      }

      let newTotal = (current.agua_ml || 0) + amount;
      if (newTotal < 0) newTotal = 0;

      const { data: updated, error } = await supabaseAdmin
        .from('progresso_usuario')
        .update({ agua_ml: newTotal })
        .eq('id', current.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json(updated);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }
}

module.exports = new ProgressoController();