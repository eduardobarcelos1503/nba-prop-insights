# Publicar o frontend no Vercel

O projeto está configurado para TanStack Start com o preset Nitro do Vercel.

## Configuração

1. No Vercel, importe `eduardobarcelos1503/nba-prop-insights`.
2. Em **Production Branch**, selecione `codex` enquanto as alterações não
   estiverem mescladas na `main`.
3. O framework deve aparecer como **TanStack Start**.
4. Mantenha o comando de build como `npm run build` e o diretório de saída
   detectado automaticamente.
5. Adicione estas variáveis em **Settings > Environment Variables**:

```env
VITE_API_BASE_URL=https://SEU-BACKEND.vercel.app
VITE_DEMO_MODE=false
```

`VITE_API_BASE_URL` é incluída no código enviado ao navegador, portanto deve
conter apenas a URL pública do backend e nunca senhas ou tokens.

Depois de salvar as variáveis, faça um novo deploy. Se a URL do frontend mudar,
atualize também `CORS_ORIGINS` no projeto do backend.
