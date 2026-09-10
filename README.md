# NBA Prop Insights

Crie exclusivamente o frontend de uma aplicação chamada “NBA Props Analyzer”.

Prioridade absoluta:

- Concentre todo o trabalho na interface, experiência do usuário, responsividade, gráficos e organização das análises.
- Não crie backend.
- Não crie banco de dados.
- Não utilize Supabase.
- Não crie autenticação própria.
- Não modifique nem substitua minha API.
- Não invente endpoints.
- O backend Flask, PostgreSQL, JWT e integração com a NBA serão desenvolvidos separadamente por mim.
- Se algum endpoint ainda não estiver disponível, crie uma camada de mock isolada e fácil de remover.
- Toda comunicação deve passar por uma camada centralizada de serviços HTTP.

Tecnologias:

- React com TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Recharts.
- React Query.
- React Router.
- Lucide Icons.
- Variável `VITE_API_BASE_URL` para definir a URL do backend.
- Textos em português do Brasil.

Design:

Crie um dashboard esportivo premium, inspirado em plataformas profissionais de análise da NBA.

- Tema escuro em azul-marinho ou grafite.
- Destaques em laranja, azul e verde.
- Cards modernos e bem espaçados.
- Interface limpa, sem informações amontoadas.
- Excelente experiência em computador e celular.
- Modo claro e escuro.
- Skeletons durante carregamentos.
- Animações discretas.
- Estados vazios e mensagens de erro amigáveis.
- Não depender de imagens externas para a interface funcionar.

Páginas:

1. `/login`
2. `/cadastro`
3. `/dashboard`
4. `/analises`
5. `/admin`
6. Página 404

Autenticação visual:

Criar telas completas de login e cadastro.

Login:

```http
POST /login
```

```json
{
  "email": "usuario@email.com",
  "senha": "senha"
}
```

Resposta:

```json
{
  "token": "JWT"
}
```

Cadastro:

```http
POST /cadastro
```

```json
{
  "nome": "Nome",
  "email": "usuario@email.com",
  "senha": "senha"
}
```

Enviar o token nas rotas protegidas:

```http
Authorization: Bearer <token>
```

Se o token estiver ausente ou expirado, voltar para `/login`.

Dashboard:

No cabeçalho, mostrar:

- Nome “NBA Props Analyzer”.
- Temporada selecionada.
- Usuário conectado.
- Alternância de tema.
- Acesso ao histórico.
- Botão de logout.

Criar uma área principal para selecionar:

- Jogador, com pesquisa por nome.
- Temporada, como `2025-26`.
- Tipo: Regular Season, Playoffs ou Pre Season.
- Amostra: últimos 5, 10, 15, 20 jogos ou temporada inteira.
- Botão “Analisar jogador”.

Buscar jogadores em:

```http
GET /jogadores
Authorization: Bearer <token>
```

Resposta esperada:

```json
[
  {
    "id": "jamesle01",
    "nome": "LeBron James"
  }
]
```

Buscar partidas reais em:

```http
GET /jogadores/{code}/nba?temporada=2025-26&tipo=Regular%20Season
Authorization: Bearer <token>
```

A resposta conterá:

```json
{
  "code": "jamesle01",
  "nome": "LeBron James",
  "nba_player_id": 2544,
  "temporada": "2025-26",
  "tipo_temporada": "Regular Season",
  "pontos": [21, 29, 33],
  "media": 27.67,
  "maximo": 33,
  "minimo": 21,
  "desvio_padrao": 4.92,
  "jogos": 3,
  "partidas": [
    {
      "game_id": "0022500001",
      "data": "2025-10-21",
      "adversario": "LAL vs. GSW",
      "pontos": 21
    }
  ]
}
```

O frontend deve ordenar as partidas da mais recente para a mais antiga e aplicar o filtro de quantidade de jogos localmente.

Perfil estatístico:

Após selecionar o jogador, mostrar:

- Nome.
- Temporada.
- Jogos considerados.
- Média.
- Mediana.
- Desvio padrão.
- Maior pontuação.
- Menor pontuação.
- Média nos últimos 5 jogos.
- Média nos últimos 10 jogos.
- Tendência recente.
- Indicador de consistência.

Gráfico:

Criar um gráfico de linha interativo contendo:

- Datas no eixo horizontal.
- Pontos no eixo vertical.
- Pontuação por partida.
- Linha horizontal da média.
- Linha horizontal da aposta informada.
- Tooltip com data, adversário e pontos.
- Jogos acima da linha em verde.
- Jogos abaixo da linha em vermelho.
- Opção de visualizar últimos 5, 10, 15 ou 20 jogos.

Tabela:

Exibir:

- Data.
- Adversário.
- Casa ou fora.
- Pontos.
- Diferença para a linha.
- Resultado Over ou Under.
- Indicador visual de acerto.

Calculadora de aposta:

Criar um card destacado com:

- Campo para linha, como `25.5`.
- Campo para odd decimal, como `1.90`.
- Seletor Over ou Under.
- Casa de aposta opcional.
- Observação opcional.
- Botão “Calcular análise”.

Mostrar:

- Jogos analisados.
- Vitórias e derrotas históricas.
- Percentual de acerto.
- Probabilidade implícita: `1 / odd`.
- Odd justa: `1 / probabilidade estimada`.
- Edge.
- Valor esperado:
  `EV = probabilidade × (odd - 1) - (1 - probabilidade)`.
- Lucro simulado apostando uma unidade em cada jogo.
- Selo “Valor positivo” ou “Sem valor”.

Exibir claramente:

“Os resultados representam somente o histórico da amostra selecionada. Desempenho passado não garante resultados futuros.”

Comparação:

Comparar em cards:

- Últimos 5 jogos.
- Últimos 10 jogos.
- Últimos 15 jogos.
- Temporada inteira.

Cada card deve mostrar média, desvio padrão, percentual de Over e percentual de Under na linha escolhida.

Histórico de análises:

Inicialmente, salvar no `localStorage`, mas isolar essa implementação em um serviço para que posteriormente seja substituída por endpoints do backend.

Salvar:

- Jogador.
- Data da análise.
- Temporada.
- Quantidade de jogos.
- Linha.
- Odd.
- Over ou Under.
- Média.
- Percentual histórico.
- Edge.
- EV.
- Observações.

A página `/analises` deve oferecer:

- Pesquisa por jogador.
- Filtro por data.
- Filtro Over/Under.
- Ordenação por EV.
- Visualização detalhada.
- Exclusão com confirmação.
- Exportação para CSV.

Área administrativa:

Criar apenas a interface e integrar com:

```http
POST /jogadores
```

```json
{
  "nome": "LeBron James"
}
```

E:

```http
POST /jogadores/{code}/sincronizar
```

```json
{
  "temporada": "2025-26",
  "tipo": "Regular Season"
}
```

A área deve mostrar cadastro de jogador, botão de sincronização, carregamento, resultado e erros. Ela só deve aparecer quando o JWT indicar que o usuário é administrador.

Qualidade:

- Criar tipos TypeScript para todas as respostas.
- Separar componentes, páginas, cálculos e serviços HTTP.
- Centralizar tratamento de erros.
- Validar linha maior ou igual a zero.
- Validar odd maior que 1.
- Evitar requisições duplicadas.
- Utilizar cache do React Query.
- Não colocar dados simulados diretamente dentro dos componentes.
- Manter mocks em uma pasta separada.
- Criar um modo de demonstração controlado por variável de ambiente.
- Entregar um frontend funcional e navegável, não somente um protótipo.
- Priorizar acabamento visual e facilidade de uso.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7971fa08-0291-43b2-91b6-237491ec0b4b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
