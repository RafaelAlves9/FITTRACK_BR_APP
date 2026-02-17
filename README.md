# FitTrack BR

**FitTrack** é um aplicativo fitness completo desenvolvido em React Native, com o objetivo de reunir todas as funcionalidades necessárias para acompanhar seu progresso de forma integrada e intuitiva.

---

## 📱 Sobre o Projeto

O FitTrack foi pensado para ser o seu companheiro fitness definitivo. Seja para quem está começando ou para atletas experientes, o app oferece ferramentas para registrar, analisar e evoluir em cada aspecto da sua jornada de saúde e condicionamento físico.

---

## ✨ Funcionalidades

### 🏋️ Treinos e Exercícios
- **Cadastro de treinos** — Crie e gerencie treinos personalizados
- **Histórico de evolução** — Acompanhe a evolução de cargas e repetições ao longo do tempo
- **Treinos pré-definidos** — Biblioteca de treinos prontos para diferentes objetivos
- **Treinos customizados** — Monte seus próprios treinos com exercícios do catálogo
- **Sessão de treino** — Registre séries, pesos e repetições em tempo real
- **Favoritos** — Salve seus treinos preferidos para acesso rápido

### ✅ Daily Check
- Registro diário de check-in para manter a consistência
- Acompanhamento de hábitos e aderência à rotina

### 💧 Controle de Água
- Registro de consumo diário de água
- Metas personalizáveis de hidratação

### 📏 Medidas e Peso
- Controle de peso com histórico completo
- Registro de medidas corporais (circunferências, etc.)
- Visualização de evolução ao longo do tempo

### 🍽️ Registro de Refeições com IA
- **Reconhecimento por foto** — Tire uma foto da refeição e a IA identifica os alimentos
- **Descrição em texto** — Descreva o que comeu e obtenha estimativa de macros
- **Peso e macros automáticos** — Estimativa de calorias, proteínas, carboidratos e gorduras
- Integração com base de dados nutricional (TACO)
- Receitas personalizadas e gerenciamento de alimentos

### 📅 Calendário
- Visualização de todos os registros por dia
- Navegação entre datas para consultar histórico
- Indicadores visuais de dias com atividade registrada

### 📊 Resumo Diário
- Visão consolidada do dia (treinos, dieta, água, medidas)
- **Compartilhamento por imagem** — Gere cards para compartilhar nas redes sociais
- Exportação visual do progresso

### 👤 Perfil e Metas
- Configuração de metas nutricionais e de treino
- Onboarding personalizado para novos usuários
- Autenticação e sincronização de dados

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **React Native** | Framework mobile multiplataforma |
| **Expo** | Build, deploy e ferramentas de desenvolvimento |
| **Expo Router** | Navegação baseada em arquivos |
| **TypeScript** | Tipagem estática |
| **SQLite** | Armazenamento local (expo-sqlite) |
| **Abacus AI** | Reconhecimento de alimentos por imagem |
| **NativeWind** | Estilização com Tailwind CSS |
| **React Native Reanimated** | Animações fluidas |

---

## 📁 Estrutura do Projeto

```
├── app/                    # Rotas (Expo Router)
│   ├── (tabs)/             # Telas principais (abas)
│   │   ├── index.tsx       # Início
│   │   ├── workouts.tsx    # Treinos
│   │   ├── diet.tsx        # Dieta
│   │   ├── measurements.tsx# Medidas
│   │   ├── calendar.tsx    # Calendário
│   │   ├── summary.tsx     # Resumo
│   │   └── profile.tsx     # Perfil
│   ├── custom-workouts/    # Treinos personalizados
│   ├── workout-session.tsx # Sessão de treino
│   ├── meal-create.tsx     # Criar refeição (com IA)
│   ├── day-summary.tsx     # Resumo do dia
│   └── ...
├── components/             # Componentes reutilizáveis
│   ├── ui/                 # Componentes base
│   ├── workout/            # Componentes de treino
│   ├── feature/            # Modais e features específicas
│   └── custom-workout/     # Treinos customizados
├── contexts/               # AuthContext, DataContext
├── services/               # Lógica de negócio e APIs
│   ├── abacusAI.ts         # IA para reconhecimento de alimentos
│   ├── workouts.ts
│   ├── foods.ts
│   ├── database.ts
│   └── ...
├── features/               # Features (View, Controller, ViewModel)
├── constants/              # Cores, temas, exercícios
├── hooks/                  # Hooks customizados
└── utils/                  # Utilitários
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm ou npm
- Expo CLI (instalado via dependências)
- Android Studio ou Xcode (para emulador)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/FITTRACKBR/FITTRACK_BR_APP.git
cd FITTRACK_BR_APP

# Instale as dependências
pnpm install
# ou
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves (ex: Abacus AI)
```

### Executando

```bash
# Iniciar em modo desenvolvimento
pnpm start
# ou
npm start

# Android
pnpm android
# ou
npm run android

# iOS
pnpm ios
# ou
npm run ios
```

### Build APK (Android)

```bash
# Use o script fornecido
BUILD_APK_LOCAL.bat
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto. Consulte `.env.example` para referência.

| Variável | Descrição |
|----------|-----------|
| `EXPO_PRIVATE_ABACUS_AI_API_KEY` | Chave da API Abacus AI para reconhecimento de alimentos |

---

## 📱 Plataformas

- **Android** — Suportado (package: `com.fittrack.app`)
- **iOS** — Suportado (bundle: `com.fittrack.app`)
- **Web** — Suportado (modo estático)

---

## 📄 Licença

Projeto privado. Todos os direitos reservados.

---

<p align="center">
  Desenvolvido com 💪 para a comunidade fitness brasileira
</p>
