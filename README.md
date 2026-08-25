# Condomínio Interativo

Gostaria de transfomar esse diagnóstico em uma ferramenta gamificada e interativa onde as respostas do usuario vão interagindo com o ambiente, quero que vc entenda o proposito das perguntas e crie uma ferramenta gamificada e interativa onde o usuario possa responder as perguntas do formulario porém não de forma de um formulario tradicional. a plataforma sera disponibilizada para donos e sindicos de condominios, é uma ferramenta profissional, gostaria que havessem elementos 3d como se fosse um condominio 3d e as perguntas e respostas fossem interagindo nesse modelo. Enfim, também estou te enviando o logotipo da empresa que esta oferecendo essa ferramenta, por fim o objetivo é capturar o lead do usuario que responda todas as perguntas e logo após agendar uma reuniao com ele para apresentar o seu relatorio. Mas como MVP precisamos da ferramenta interativa e da captação do lead.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://diagnosticomagav.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e1cfc8fc-f6fe-4ad8-8b57-bfb1b7a681b3).

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

## Leads com Supabase

1. Crie um projeto no [Supabase](https://supabase.com) e execute `supabase/schema.sql` no SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Para a Vercel, cadastre as mesmas variáveis em Project Settings > Environment Variables.
4. Mantenha `SUPABASE_SERVICE_ROLE_KEY` somente no ambiente do servidor; ela nunca deve ser usada em componentes ou variáveis `VITE_*`.

O webhook `LEAD_WEBHOOK_URL` é opcional e funciona como integração secundária. O lead é salvo primeiro no Supabase; se o webhook falhar, o registro permanece preservado no banco.
