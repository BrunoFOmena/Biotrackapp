// === 1. Configuração do Supabase ===
const SUPABASE_URL     = 'https://uaceknktpgvhmedfdobf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhY2Vrbmt0cGd2aG1lZGZkb2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzYwMTQsImV4cCI6MjA2Mjg1MjAxNH0.fKGJtD1kj7X0Btgd2SCg3dzgs2o97MgK-zWmFvOTiFY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === 2. Seleção de elementos do DOM ===
const lista         = document.getElementById('lista-culturas');
const contadorValor = document.getElementById('contadorValor');
const btnNova       = document.getElementById('nova-cultura');
const modal         = document.getElementById('modal-form');
const inputNome     = document.getElementById('input-nome');
const inputMeio     = document.getElementById('input-meio');
const inputData     = document.getElementById('input-data');
const inputResp     = document.getElementById('input-responsavel'); // novo
const btnSave       = document.getElementById('btn-save');
const btnCancel     = document.getElementById('btn-cancel');

// Ajusta o máximo da data para hoje
inputData.max = new Date().toISOString().split('T')[0];

// === 3. Handlers do modal ===
btnNova.addEventListener('click', () => {
  // Limpa campos e abre modal
  inputNome.value = '';
  inputMeio.value = '';
  inputData.value = '';
  inputResp.value = '';       // limpa o responsável
  modal.classList.add('show');
  inputNome.focus();
});

btnCancel.addEventListener('click', () => {
  modal.classList.remove('show');
});

// === 4. Função que carrega todas as culturas do Supabase e renderiza ===
async function renderizar() {
  lista.innerHTML = '';

  const { data: culturas, error } = await supabaseClient
    .from('culturas')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao carregar dados do Supabase:', error.message);
    return;
  }

  contadorValor.textContent = culturas.length;

  culturas.forEach(c => {
    const card = document.createElement('li');
    card.className = 'card';
    card.innerHTML = `
      <strong>Linhagem:</strong> ${c.nome}<br>
      <strong>Meio:</strong> ${c.meio}<br>
      <strong>Início:</strong> ${c.data}<br>
      <strong>Responsável:</strong> ${c.responsavel}<br>
    `;
    // botão de descarte
    const btn = document.createElement('button');
    btn.className = 'btn-discard';
    btn.textContent = '×';
    btn.dataset.id = c.id;
    card.appendChild(btn);

    lista.appendChild(card);
  });
}

// === 5. Salvar nova cultura ===
btnSave.addEventListener('click', async () => {
  const nome = inputNome.value.trim();
  const meio = inputMeio.value.trim();
  const data = inputData.value;
  const resp = inputResp.value.trim(); // novo

  if (!nome || !meio || !data || !resp) {
    alert('Preencha todos os campos antes de salvar.');
    return;
  }

  const { error } = await supabaseClient
    .from('culturas')
    .insert([{ nome, meio, data, responsavel: resp }]);

  if (error) {
    alert('Erro ao salvar: ' + error.message);
  } else {
    modal.classList.remove('show');
    renderizar();
  }
});

// === 6. Excluir cultura ===
lista.addEventListener('click', async e => {
  if (e.target.classList.contains('btn-discard')) {
    const id = e.target.dataset.id;
    if (!confirm('Deseja realmente descartar esta cultura?')) return;

    const { error } = await supabaseClient
      .from('culturas')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao descartar: ' + error.message);
    } else {
      renderizar();
    }
  }
});

// === 7. Registrar service worker ===
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

// === 8. Inicia tudo ===
renderizar();
