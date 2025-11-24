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
      const { data: userData, error: userError } = await supabaseAdmin
        .from('usuarios')
        .insert([{
          id: authData.user.id,
          nome,
          email
        }])
        .select()
        .single();

      if (userError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.error('Erro ao criar na tabela usuarios:', userError);
        return res.status(400).json({ error: 'Erro ao registrar usuário no banco de dados.' });
      }

      // 3. Auto-Login
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

  // --- COMPLETE PROFILE (Atualizado para o novo Schema) ---
  async completeProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

      const {
        sexo,
        data_nascimento,
        altura,
        peso_inicial,
        objetivo,       // Texto (ex: "Hipertrofia")
        peso_meta,      // NOVO: Numérico (ex: 80.5)
        nivel_atividade // NOVO: Agora salvo no usuario
      } = req.body;

      // Atualiza tabela 'usuarios'
      const { error: userError } = await supabaseAdmin
        .from('usuarios')
        .update({
          sexo,
          data_nascimento,
          altura,
          peso_inicial,
          objetivo,
          peso_meta,      // Salva a meta numérica
          nivel_atividade // Salva o nível
        })
        .eq('id', userId);

      if (userError) {
        console.error("Erro update usuario:", userError);
        return res.status(400).json({ error: userError.message });
      }

      // Opcional: Se ainda quiser manter a tabela perfil_treino por compatibilidade ou dados extras
      // Mas os dados principais já estão em 'usuarios' agora.

      return res.status(200).json({ message: 'Perfil completado com sucesso!' });

    } catch (error) {
      console.error('Erro completeProfile:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  // Mantidos
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