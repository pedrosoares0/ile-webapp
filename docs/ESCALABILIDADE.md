# Escalabilidade e infraestrutura

## Arquitetura recomendada

O projeto adotará uma estratégia de dependência externa mínima. O frontend será publicado diretamente na VPS Hostinger, enquanto o Supabase continuará responsável por Auth, PostgreSQL, API, RLS, Realtime, Queues e Storage. Uma VPS não deve hospedar uma segunda cópia do banco nesta fase.

Uma VPS só passa a ser necessária para trabalhos contínuos ou agendados que não cabem bem no navegador, como cobrança automática, filas, integração com WhatsApp/e-mail, geração pesada de relatórios e processamento de imagens.

## Capacidade inicial

Para produção, usar no mínimo Supabase Pro. Começar no compute Micro e medir; subir para Small ou Medium quando CPU, memória, I/O, latência ou conexões sustentadas indicarem saturação. O número de usuários cadastrados não dimensiona sozinho a infraestrutura: usuários ativos simultâneos, consultas por tela, tamanho das imagens e taxa de escrita são os fatores relevantes.

Uma estimativa de capacidade somente será confiável após teste de carga com os fluxos reais. Metas iniciais sugeridas:

- p95 de leitura abaixo de 500 ms;
- taxa de erro abaixo de 1%;
- índices verificados nas consultas mais frequentes;
- imagens comprimidas, miniaturas e paginação no feed;
- conexão de processos server-side pelo pooler;
- alertas para CPU, memória, I/O, espaço, erros e custo.

## Infraestrutura escolhida: Hostinger

A infraestrutura inicial definida é uma VPS Hostinger com 2 vCPU, 8 GB de RAM e 100 GB NVMe. Ela é adequada à meta inicial de aproximadamente 300 usuários simultâneos desde que PostgreSQL, Auth e Storage continuem no Supabase. O frontend deve ser servido como arquivos estáticos e os trabalhos pesados devem passar por filas.

Trezentos usuários lendo feed e conversas representam uma carga bem menor que 300 uploads, relatórios ou cobranças ao mesmo tempo. A capacidade precisa ser confirmada por teste de carga, mas não é necessário contratar 4 vCPU antes de observar saturação real.

### O que contratar e configurar na Hostinger

- VPS de 2 vCPU, 8 GB RAM e 100 GB NVMe;
- data center de São Paulo;
- Ubuntu 24.04 LTS sem painel de hospedagem pesado;
- IPv4 público e domínio apontado para a VPS;
- backup diário contratado, além de cópia externa das configurações;
- firewall da Hostinger permitindo somente `22`, `80` e `443`;
- acesso SSH exclusivamente por chave e usuário administrativo sem login direto como root;
- atualizações automáticas de segurança;
- Docker Engine e Docker Compose;
- Nginx ou Caddy como proxy reverso, HTTPS e compressão;
- DNS apontado diretamente para a Hostinger; Cloudflare é opcional, não obrigatório;
- healthchecks e política `restart: unless-stopped` nos containers;
- monitoramento de CPU, RAM, disco, carga, containers e disponibilidade externa;
- alertas antes de CPU sustentada em 70%, RAM em 75% e disco em 70%;
- 4 GB de swap somente como proteção contra picos, nunca como substituto de RAM;
- rotação e limite de tamanho dos logs.

A Hostinger fornece backup semanal por padrão e permite contratar backups diários. Os backups da VPS não substituem exportações independentes do banco e testes de restauração. Consulte a [documentação oficial de backup da Hostinger](https://www.hostinger.com/support/1583232-how-to-back-up-or-restore-a-vps-at-hostinger/).

### Serviços que devem rodar na VPS

1. `web`: arquivos estáticos do frontend servidos por Nginx/Caddy.
2. `worker`: consumidor TypeScript/Node.js das filas.
3. `scheduler`: agenda cobranças, lembretes e tarefas recorrentes.
4. `monitoring`: Uptime Kuma e monitoramento local dos containers, com exportação externa opcional.

Não instalar PostgreSQL, Supabase self-hosted, MinIO, RabbitMQ e Redis nessa mesma VPS na primeira fase. Isso criaria mais pontos de falha, manutenção e disputa pelos dois núcleos disponíveis.

## Política de dependências externas mínimas

A base inicial terá somente dois fornecedores obrigatórios:

1. **Hostinger:** frontend, proxy HTTPS, worker, scheduler e monitoramento operacional.
2. **Supabase:** banco, autenticação, API, RLS, arquivos, tempo real e fila.

Todo recurso que puder ser implementado de forma segura e sustentável no projeto deverá permanecer no código ou nesses dois ambientes. Evitar serviços separados para cache, fila, busca, logs, analytics e automação enquanto a necessidade não for comprovada.

Componentes locais recomendados:

- Nginx ou Caddy para frontend, proxy, HTTPS e compressão;
- Node.js/TypeScript para worker e scheduler;
- Supabase Queues/pgmq, sem RabbitMQ, Kafka ou Redis;
- PostgreSQL full-text search antes de contratar mecanismo de busca externo;
- Uptime Kuma para disponibilidade;
- métricas de Docker e do sistema operacional;
- logs JSON com rotação local e cópia periódica;
- cron ou scheduler do próprio worker;
- scripts de backup e restauração versionados no repositório;
- analytics próprio e simples no PostgreSQL, se necessário.

Não confundir menos fornecedores com ausência de redundância. Banco e arquivos não devem existir exclusivamente na VPS, e os backups precisam ter ao menos uma cópia fora da máquina que está sendo protegida.

### Critério de upgrade

Subir para 4 vCPU quando, mesmo depois de otimização, a CPU ficar acima de 70% por períodos sustentados, a fila crescer continuamente ou os jobs deixarem de cumprir o tempo esperado. Aumentar RAM se o uso real ficar acima de 75% ou ocorrer OOM. O compute do Supabase deve ser escalado separadamente quando o gargalo estiver no banco.

## Comunicação profissional entre usuários

O sistema de comunicação deve separar o registro permanente da mensagem, a entrega em tempo real e os trabalhos assíncronos.

```text
Aplicativo
  -> PostgreSQL: grava mensagem e histórico
  -> Supabase Realtime: avisa destinatários conectados
  -> Supabase Queue: cria notificações e trabalhos confiáveis
  -> Worker Hostinger: push, e-mail, WhatsApp, moderação e retentativas
```

### Chat e comunicação dentro do aplicativo

Usar PostgreSQL/Supabase como fonte de verdade e criar as tabelas:

- `conversations`: conversa direta, grupo ou canal de terreiro;
- `conversation_participants`: participantes, papel, entrada e saída;
- `messages`: remetente, conteúdo, resposta, edição e exclusão lógica;
- `message_receipts`: entregue e lida por destinatário;
- `message_attachments`: metadados dos arquivos no Storage;
- `user_blocks`: bloqueios entre usuários;
- `message_reports`: denúncias e moderação;
- `notifications`: notificações persistentes dentro do aplicativo;
- `device_tokens`: dispositivos autorizados a receber push.

Todas essas tabelas precisam de RLS. Um usuário somente pode ler uma conversa da qual participa; administradores não devem ganhar acesso automático a conversas privadas sem uma regra de produto e base legal explícitas.

Para atualização imediata, usar canais privados do Supabase Realtime:

- **Broadcast** para nova mensagem, digitando e eventos rápidos;
- **Presence** somente para online/offline e estado de baixa frequência;
- mensagens sempre persistidas primeiro no PostgreSQL;
- ao reconectar, o aplicativo busca mensagens perdidas no banco;
- paginação por cursor usando `created_at` e `id`;
- confirmação de leitura gravada em `message_receipts`.

Broadcast é a opção recomendada pelo próprio Supabase para melhor escalabilidade e segurança; `Postgres Changes` é mais simples, mas escala pior. Consulte [Realtime](https://supabase.com/docs/guides/realtime) e [Broadcast de alterações](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes).

### Fila e mensageria interna

Usar **Supabase Queues/pgmq** inicialmente. É uma fila durável dentro do PostgreSQL, com janela de visibilidade, entrega garantida, arquivamento e autorização. Consulte a [documentação oficial do Supabase Queues](https://supabase.com/docs/guides/queues).

Filas sugeridas:

- `notification_delivery`: push e notificações externas;
- `billing_notifications`: cobranças e lembretes;
- `email_delivery`: e-mails transacionais;
- `media_processing`: miniaturas, compressão e validação;
- `moderation_jobs`: denúncias e verificações;
- `report_generation`: relatórios demorados.

O worker na Hostinger deve:

1. reservar uma mensagem da fila;
2. executar a operação com chave de idempotência;
3. confirmar e arquivar somente depois do sucesso;
4. aplicar retentativa exponencial em falhas temporárias;
5. mover falhas permanentes para uma fila morta;
6. registrar provedor, tentativa, resposta, erro e duração;
7. limitar concorrência para não consumir toda a CPU;
8. expor healthcheck e métricas.

Não usar Kafka nesta etapa. Kafka é apropriado para grande volume de eventos, múltiplos consumidores e retenção/reprocessamento em escala muito maior. RabbitMQ ou Redis/BullMQ também não são necessários enquanto o Supabase Queues atender a vazão e as garantias exigidas.

### Notificações fora do aplicativo

- notificações dentro do aplicativo: implementar integralmente com PostgreSQL e Supabase Realtime;
- push web: começar sem ele; adicionar Firebase Cloud Messaging somente se notificações com o navegador fechado se tornarem requisito;
- e-mail: usar inicialmente SMTP transacional do domínio/Hostinger quando a entregabilidade for suficiente;
- WhatsApp: usar somente a API oficial da Meta quando o envio automático se tornar requisito;
- segredos dos provedores somente no worker/secret manager, nunca no Vite;
- cada envio precisa de consentimento, opt-out, auditoria e política de retenção;
- webhooks dos provedores devem atualizar estados `queued`, `sent`, `delivered`, `read` e `failed`.

Edge Functions são adequadas para endpoints curtos, autenticação de webhooks e integrações leves. Processamento pesado ou prolongado deve ficar no worker da VPS, conforme a [orientação oficial sobre Edge Functions](https://supabase.com/docs/guides/functions).

Não hospedar um servidor de e-mail completo na VPS. Embora isso reduza um fornecedor, aumenta muito o risco de spam, bloqueio de IP, falhas de SPF/DKIM/DMARC e perda de mensagens. O SMTP fornecido pelo domínio é a alternativa inicial de menor complexidade.

### Segurança e qualidade da comunicação

- limite de mensagens por usuário, conversa e IP;
- validação de MIME, tamanho e extensão dos anexos;
- antivírus ou varredura dos arquivos antes da liberação;
- URLs assinadas para anexos privados;
- exclusão lógica e trilha de auditoria;
- denúncia, bloqueio, silenciamento e administração de grupos;
- proteção contra spam e automação abusiva;
- criptografia TLS em trânsito e criptografia do provedor em repouso;
- política LGPD para retenção, exportação e exclusão;
- testes automatizados das policies de todas as combinações de participantes.

Criptografia ponta a ponta não deve ser prometida apenas por usar HTTPS ou Supabase. E2EE exige gerenciamento de chaves nos dispositivos, recuperação, múltiplos aparelhos e mudanças importantes na moderação. Deve ser tratada como projeto separado caso se torne requisito.

## Melhorias obrigatórias antes de escalar

1. Paginação por cursor em feed, stories, avisos, eventos e listas administrativas.
2. Remover consultas amplas e selecionar somente as colunas usadas.
3. Gerar tipos TypeScript do schema e eliminar `any` nas respostas.
4. Índices guiados por `pg_stat_statements` e planos `EXPLAIN ANALYZE`.
5. Miniaturas WebP/AVIF, limites por usuário e política de retenção no Storage.
6. Testes automatizados de RLS e fluxos críticos em CI.
7. Ambiente separado de homologação e produção.
8. Backup diário, teste periódico de restauração e, conforme criticidade, PITR.
9. Rate limiting, CAPTCHA em cadastro/oração e proteção contra abuso.
10. Worker idempotente com fila e provedor oficial para cobranças; nunca considerar uma mensagem enviada apenas porque foi registrada localmente.
11. Observabilidade de frontend, API, banco, worker e custos.
12. Revisão LGPD, consentimento, retenção, exportação e exclusão de dados.

## Faixas de evolução

- início e validação: Hostinger + Supabase Pro Micro;
- crescimento: Supabase Small/Medium, otimização de consultas, paginação e worker pequeno;
- carga sustentada: teste de carga, compute dedicado, filas, cache seletivo e réplicas de leitura quando justificadas;
- operação crítica: redundância dos workers, PITR, plano de incidente, SLO e suporte com SLA.

Não existe promessa técnica de “N usuários” sem definir simultaneidade e comportamento. A decisão de upgrade deve ser baseada em carga observada e testes reproduzíveis.
