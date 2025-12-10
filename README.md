# LidIA - PAES | Dashboard de Atendimentos

Dashboard completo para visualização de métricas e relatórios de atendimento da LidIA.

## 🚀 Tecnologias

### Backend
- FastAPI (Python)
- Supabase Client
- Uvicorn

### Frontend
- React 18
- Vite
- Recharts (gráficos)
- Axios
- jsPDF (exportação PDF)
- XLSX (exportação Excel)

## 📦 Estrutura do Projeto

```
lidia-dashboard/
├── backend/           # API FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/          # React App
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_aqui
VITE_API_URL=http://seu-dominio:4142
```

### 2. Deploy no Easypanel

#### Passo 1: Criar Repositório no GitHub

```bash
# Inicializar repositório
cd lidia-dashboard
git init
git add .
git commit -m "Initial commit - LidIA Dashboard"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/lidia-dashboard.git
git branch -M main
git push -u origin main
```

#### Passo 2: Conectar no Easypanel

1. Acesse seu Easypanel
2. Clique em **"Create New App"**
3. Selecione **"GitHub"**
4. Escolha o repositório `lidia-dashboard`
5. Configure:
   - **Build Method**: Docker Compose
   - **Port**: 4142 (backend) e 80 (frontend)
   - **Environment Variables**:
     ```
     SUPABASE_URL=https://seu-projeto.supabase.co
     SUPABASE_KEY=sua_chave_aqui
     VITE_API_URL=http://seu-dominio:4142
     ```

6. Clique em **"Deploy"**

## 🖥️ Desenvolvimento Local

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 4142
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker

### Build e Run com Docker Compose

```bash
docker-compose up --build
```

Acesse:
- Frontend: http://localhost
- Backend API: http://localhost:4142
- Documentação API: http://localhost:4142/docs

## 📊 Endpoints da API

### Resumo Geral
```
GET /api/resumo
```
Retorna métricas de hoje, semana e mês.

### Relatório Diário
```
GET /api/relatorio-diario?dias=30
```

### Relatório por Período
```
POST /api/relatorio-periodo
Body: {
  "data_inicio": "2024-01-01",
  "data_fim": "2024-01-31"
}
```

### Relatório Semanal
```
GET /api/relatorio-semanal?semanas=12
```

### Relatório Mensal
```
GET /api/relatorio-mensal?meses=12
```

### Usuários Mais Ativos
```
GET /api/usuarios-ativos
```

### Estatísticas Gerais
```
GET /api/stats
```

## 🎨 Funcionalidades do Dashboard

✅ **Cards de Resumo**
- Métricas de hoje, semana e mês
- Total de interações e pessoas atendidas
- Taxa de conversão

✅ **Gráficos Interativos**
- Evolução de interações ao longo do tempo
- Comparativo entre interações, pessoas e qualificados

✅ **Filtros de Período**
- Últimos 7, 30 ou 90 dias
- Atualização em tempo real

✅ **Tabela Detalhada**
- Visualização diária completa
- Métricas organizadas

✅ **Exportação**
- PDF com logo e dados formatados
- Excel com planilha completa

✅ **Design Responsivo**
- Funciona em desktop, tablet e mobile
- Tema baseado nas cores da LidIA (roxo/lilás)

## 🎯 Porta Configurada

O backend roda na porta **4142** conforme solicitado.

## 🔐 Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env` com credenciais reais
- Use variáveis de ambiente no Easypanel
- Mantenha a `SUPABASE_KEY` segura

## 📱 Acesso

Após o deploy, o dashboard estará disponível em:
```
http://seu-dominio.com
```

## 🐛 Troubleshooting

### Erro ao conectar no Supabase
Verifique se `SUPABASE_URL` e `SUPABASE_KEY` estão corretas no `.env`

### Frontend não carrega dados
Verifique se `VITE_API_URL` aponta para o backend correto

### Erro de CORS
O backend já está configurado para aceitar requisições de qualquer origem

## 📞 Suporte

Em caso de dúvidas ou problemas, revise a configuração das variáveis de ambiente e logs do container.

---

**Desenvolvido para LidIA - PAES** 💜
