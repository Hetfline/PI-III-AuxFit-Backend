const { supabase, supabaseAdmin } = require('../config/supabase');

class AuthController {
  
  // --- REGISTER (Cria usuário básico) ---
  async register(req, res) {
    try {
      const { email, password, nome } = req.body;

      if (!email || !password || !nome) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      // 1. Criar no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } }
      });

      if (authError) return res.status(400).json({ error: authError.message });
      if (!authData.user) return res.status(400).json({ error: 'Erro na criação do Auth.' });

      // 2. Inserir na tabela 'usuarios'
      // Nota: IDs agora são Identity, mas o ID do usuário DEVE ser o mesmo do Auth (UUID),
      // por isso inserimos manualmente o ID aqui.
      const { data: userData, error: userError } = await supabaseAdmin
        .from('usuarios')
        .insert([{
          id: authData.user.id, // Vincula o UUID do Auth
          nome,
          email
        }])
        .select()
        .single();

      if (userError) {
        // Rollback: apaga o usuário do Auth se falhar no banco
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.error('Erro ao criar na tabela usuarios:', userError);
        return res.status(400).json({ error: 'Erro ao registrar usuário no banco de dados.' });
      }

      // 3. Auto-Login para retornar sessão
      const { data: sessionData } = await supabase.auth.signInWithPassword({
        email, password
      });

      return res.status(201).json({
        message: 'Usuário criado com sucesso!',
        user: userData,
        session: sessionData.session
      });

    } catch (error) {
      console.error('Erro fatal no registro:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // --- LOGIN ---
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return res.status(401).json({ error: 'Email ou senha incorretos.' });

      // Busca dados do usuário
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) return res.status(404).json({ error: 'Perfil de usuário não encontrado.' });

      return res.status(200).json({
        message: 'Login realizado!',
        session: data.session,
        user: usuario
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno.' });
    }
  }

  // --- COMPLETE PROFILE (Onboarding) ---
  async completeProfile(req, res) {
    try {
      // Pega ID do usuário logado (vem do middleware auth)
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const {
        sexo,
        data_nascimento,
        altura,
        peso_inicial,
        objetivo,
        nivel_atividade // Esse campo vai para a tabela perfil_treino
      } = req.body;

      // 1. Atualiza tabela 'usuarios'
      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          sexo,
          data_nascimento,
          altura,
          peso_inicial,
          objetivo
        })
        .eq('id', userId);

      if (userError) {
        console.error("Erro update usuario:", userError);
        return res.status(400).json({ error: userError.message });
      }

      // 2. Atualiza/Cria tabela 'perfil_treino'
      // Verifica se já existe perfil
      const { data: existingProfile } = await supabase
        .from('perfil_treino')
        .select('id')
        .eq('usuario_fk', userId)
        .maybeSingle(); // Use maybeSingle para não dar erro se for nulo

      let perfilError;

      if (existingProfile) {
        // Atualiza existente
        const { error } = await supabase
          .from('perfil_treino')
          .update({ nivel_atividade })
          .eq('usuario_fk', userId);
        perfilError = error;
      } else {
        // Cria novo
        const { error } = await supabase
          .from('perfil_treino')
          .insert([{
            usuario_fk: userId,
            nivel_atividade
          }]);
        perfilError = error;
      }

      if (perfilError) {
        console.error("Erro perfil_treino:", perfilError);
        // Não retornamos erro fatal aqui, pois o usuário principal foi salvo
        return res.status(200).json({ 
          message: 'Perfil salvo (com aviso no treino).',
          warning: 'Erro ao salvar nível de atividade.'
        });
      }

      return res.status(200).json({ message: 'Perfil completado com sucesso!' });

    } catch (error) {
      console.error('Erro completeProfile:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // --- OUTROS MÉTODOS (Mantidos para evitar erros de rota) ---
  async logout(req, res) {
    await supabase.auth.signOut();
    res.status(200).json({ message: 'Logout ok' });
  }
  
  async me(req, res) {
    const { data } = await supabase.from('usuarios').select('*').eq('id', req.user.id).single();
    res.json({ user: data });
  }

  async forgotPassword(req, res) { res.status(200).json({ message: 'Feature pendente' }); }
  async updatePassword(req, res) { res.status(200).json({ message: 'Feature pendente' }); }
}

module.exports = new AuthController();