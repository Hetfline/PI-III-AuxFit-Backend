const { supabaseAdmin } = require('../config/supabase');

class ProgressoController {
  
  // --- ROTAS EXISTENTES (MANTIDAS) ---
  async create(req, res) { /* ... código anterior ... */ }
  async getAllByUser(req, res) { /* ... código anterior ... */ }
  async update(req, res) { /* ... código anterior ... */ }
  async delete(req, res) { /* ... código anterior ... */ }

  // --- NOVAS ROTAS PARA ÁGUA / DIA ATUAL ---

  // Busca (ou cria) o registro de progresso de HOJE
  async getToday(req, res) {
    try {
      const usuario_fk = req.user.id;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Tenta buscar registro de hoje
      let { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .select('*')
        .eq('usuario_fk', usuario_fk)
        .eq('data_registro', today)
        .maybeSingle();

      if (error) return res.status(400).json({ error: error.message });

      // Se não existe, cria um zerado para hoje
      if (!data) {
        const { data: newData, error: createError } = await supabaseAdmin
          .from('progresso_usuario')
          .insert([{ 
             usuario_fk, 
             data_registro: today, 
             agua_ml: 0,
             peso: 0,
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

  // Adicionar (ou remover) água ao total de hoje
  async addWater(req, res) {
    try {
      const usuario_fk = req.user.id;
      const { amount } = req.body; // pode ser positivo ou negativo
      const today = new Date().toISOString().split('T')[0];

      // 1. Busca registro atual
      let { data: current } = await supabaseAdmin
        .from('progresso_usuario')
        .select('id, agua_ml')
        .eq('usuario_fk', usuario_fk)
        .eq('data_registro', today)
        .maybeSingle();

      // Se não existe (caso raro se a tela carrega o getToday antes, mas seguro prevenir), cria
      if (!current) {
         const { data: newItem } = await supabaseAdmin
          .from('progresso_usuario')
          .insert([{ usuario_fk, data_registro: today, agua_ml: 0 }])
          .select()
          .single();
         current = newItem;
      }

      // 2. Calcula novo valor (não deixa ficar negativo)
      let newTotal = (current.agua_ml || 0) + amount;
      if (newTotal < 0) newTotal = 0;

      // 3. Atualiza
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

  async getToday(req, res) {
    try {
      const usuario_fk = req.user.id;
      // Gera a string "YYYY-MM-DD" baseada no horário do servidor
      const today = new Date().toISOString().split('T')[0]; 

      // 1. Tenta buscar se JÁ EXISTE uma linha para HOJE (Dia 21)
      let { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .select('*')
        .eq('usuario_fk', usuario_fk)
        .eq('data_registro', today) // O filtro crucial é a DATA
        .maybeSingle();

      if (error) return res.status(400).json({ error: error.message });

      // 2. O "Pulo do Gato": Se data vier nulo, significa que virou o dia
      // e o usuário ainda não tem registro hoje. Então criamos agora.
      if (!data) {
        const { data: newData, error: createError } = await supabaseAdmin
          .from('progresso_usuario')
          .insert([{ 
             usuario_fk, 
             data_registro: today, // Cria com a data de HOJE
             agua_ml: 0,           // Cria ZERADO
             peso: 0,              // Ou pega o último peso (lógica extra)
             volume_total: 0
          }])
          .select()
          .single();
        
        if (createError) return res.status(400).json({ error: createError.message });
        data = newData;
      }

      // Retorna a linha (seja a que já existia ou a nova zerada)
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }
}



module.exports = new ProgressoController();