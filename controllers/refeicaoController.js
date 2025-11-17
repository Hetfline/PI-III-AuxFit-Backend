const { supabaseAdmin } = require('../config/supabase');

class RefeicaoController {
  
  // Criar nova refeição PARA O USUÁRIO LOGADO
  async create(req, res) {
    try {
      const { nome, horario, tipo_refeicao } = req.body;
      const usuario_fk = req.user.id; // Pega o ID do usuário logado (do middleware)

      if (!nome || !tipo_refeicao) {
        return res.status(400).json({ error: 'Nome e tipo de refeição são obrigatórios' });
      }

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .insert([{ 
          nome, 
          horario, // Opcional
          tipo_refeicao,
          usuario_fk // ID do usuário é obrigatório
        }])
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar todas as refeições DO USUÁRIO LOGADO
  async getAllByUser(req, res) {
    try {
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .select('*')
        .eq('usuario_fk', usuario_fk); // Filtro de segurança

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter uma refeição por ID (E DO USUÁRIO LOGADO)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .select('*')
        .eq('id', id)
        .eq('usuario_fk', usuario_fk) // Dupla verificação
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Refeição não encontrada' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar uma refeição (DO USUÁRIO LOGADO)
  async update(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;
      const { nome, horario, tipo_refeicao } = req.body;

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .update({ nome, horario, tipo_refeicao })
        .eq('id', id)
        .eq('usuario_fk', usuario_fk) // Filtro de segurança
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
         return res.status(404).json({ error: 'Refeição não encontrada ou não pertence a você' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar uma refeição (DO USUÁRIO LOGADO)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      const { error, data } = await supabaseAdmin
        .from('refeicoes')
        .delete()
        .eq('id', id)
        .eq('usuario_fk', usuario_fk) // Filtro de segurança
        .select(); // Adicionar select para verificar se algo foi deletado

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Supabase V2: 'data' é nulo no delete. Verificamos 'count' (ou a falta de erro)
      // Se RLS estivesse ativa, o delete falharia, mas como usamos supabaseAdmin
      // ele deleta se o 'id' e 'usuario_fk' baterem. Se não bater, não dá erro,
      // apenas nada é deletado.

      return res.status(204).send(); // 204 No Content
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new RefeicaoController();