const API_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🤖 --- Iniciando Bateria de Testes Automatizados Valendo --- 🤖\n');

  try {
    // 1. HEALTH CHECK
    console.log('⏳ [1/5] Checando status do Servidor...');
    const health = await fetch(`${API_URL}/`);
    console.log(`✅ Status: ${health.status} OK\n`);

    // 2. TENTATIVA DE LOGIN OU CADASTRO
    console.log('⏳ [2/5] Verificando se o usuário de teste já existe logando direto...');
    
    let token = '';

    const firstLoginAttempt = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'robo@valendo.com', password: 'senha456' })
    });

    if (firstLoginAttempt.ok) {
       console.log('✅ Acesso Liberado! Usuário já validado no banco de dados previamente.\n');
       const authData = await firstLoginAttempt.json();
       token = authData.access_token;
    } else {
       console.log('🚨 Login recusado ou não existe. Iniciando Fluxo de Cadastramento de Nova Conta...\n');
       
       console.log('⏳ [3/5] Tentando cadastrar usuário alfa...');
       const registerRes = await fetch(`${API_URL}/users`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           name: 'Valendo Tester',
           tag: 'alpha_robo',
           email: 'robo@valendo.com',
           password: 'senha456'
         })
       });

       if (!registerRes.ok) throw new Error('Não foi possível gerar a conta pro robo!');
       console.log('✅ Conta do robo criada via Prisma no PostgreSQL.\n');

       console.log('⏳ Gerando Token JWT recém criado...');
       const secondLoginAttempt = await fetch(`${API_URL}/auth/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: 'robo@valendo.com', password: 'senha456' })
       });
       const authData = await secondLoginAttempt.json();
       token = authData.access_token;
       console.log('✅ Token JWT Adquirido!\n');
    }

    // 4. CRIAR SALA PARA TESTAR
    console.log('⏳ [4/5] Injetando Token e Criando uma nova Sala privada...');
    const roomRes = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        theme: 'Cultura Geek e Games',
        isPrivate: true
      })
    });
    const roomData = await roomRes.json();
    const generatedCode = roomData.code;
    console.log(`✅ Sala instanciada! Código gerado: [ ${generatedCode} ]\n`);

    // 4. TESTAR IA e CACHE (Gemini Engine)
    // Mudamos o tema levemente para "quebrar" o cache anterior que respondeu 1 pergunta
    console.log(`⏳ [4/4] Conectando Google Gemini para o tema Desenvolvimento Web Moderno (Sala: ${generatedCode})...`);
    console.log('⏱️ Isso pode levar de 2 a 10 segundos na vida real...');

    // Montando multipart/form-data puramente em Node
    const formData = new FormData();
    formData.append('roomCode', generatedCode);
    formData.append('theme', 'Desenvolvimento Web com Node e React');

    const aiRes = await fetch(`${API_URL}/questions/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const aiData = await aiRes.json();
    if(aiRes.ok) {
       console.log(`\n🎉 SUCESSO ABSOLUTO! A IA RESPONDEU COM STATUS 201`);
       console.log(`📡 Mensagem do Servidor: ${aiData.message}`);
       console.log(`❔ Questões processadas: ${aiData.questionsGenerated.length} questões.`);
       console.log(`💡 Exemplo de pergunta processada: "${aiData.questionsGenerated[0].text}"`);
    } else {
       console.log(`❌ A IA falhou ou negou o pedido: `, aiData);
    }

  } catch (err) {
    console.error('\n💥 ERRO GRAVE NO EXECULTOR DOS TESTES:', err.message);
  }

  console.log('\n🏁 --- Fim da Bateria --- 🏁');
}

runTests();
