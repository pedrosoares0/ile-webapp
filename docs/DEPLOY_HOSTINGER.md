# Implantação na Hostinger

## Escopo

Configuração escolhida: 2 vCPU, 8 GB RAM e 100 GB NVMe, preferencialmente no data center de São Paulo. A meta inicial é atender aproximadamente 300 usuários simultâneos com Supabase responsável por banco, Auth, API, Realtime, Queues e Storage.

## Preparação da VPS

1. Instalar Ubuntu 24.04 LTS sem painel pesado.
2. Criar usuário administrativo e bloquear login SSH direto como root.
3. Usar autenticação SSH por chave e desativar senha depois de validar o acesso.
4. Liberar no firewall somente SSH, HTTP e HTTPS.
5. Instalar atualizações e habilitar correções automáticas de segurança.
6. Configurar timezone UTC no servidor; apresentação de datas fica no aplicativo.
7. Criar 4 GB de swap como proteção contra picos.
8. Instalar Docker Engine e Docker Compose.
9. Configurar domínio, HTTPS e renovação automática com Nginx ou Caddy.
10. Ativar backup diário da VPS e manter cópia externa das configurações.

## Containers planejados

- `web`: build estático do React;
- `worker`: consumidor das filas Supabase;
- `scheduler`: criação de tarefas recorrentes;
- `uptime-kuma`: disponibilidade e alertas locais.

PostgreSQL, Redis, RabbitMQ, Kafka, MinIO e Supabase self-hosted não devem ser instalados nesta VPS na fase inicial.

## Segredos

- variáveis `VITE_*` fazem parte do frontend e não podem conter segredos administrativos;
- `DATABASE_URL`, service role e credenciais de provedores pertencem somente ao ambiente do worker ou aos scripts administrativos;
- não copiar o `.env` de desenvolvimento inteiro para o container do frontend;
- usar arquivos de ambiente fora do repositório, permissões restritas e rotação de credenciais;
- trocar imediatamente qualquer senha exposta em conversa, log ou captura.

## Publicação

O pipeline esperado deve:

1. instalar dependências com lockfile;
2. executar migrations em etapa controlada e única;
3. executar `npm run build`;
4. construir imagens versionadas;
5. iniciar ou atualizar containers com healthcheck;
6. testar HTTPS e endpoint de saúde;
7. permitir rollback para a imagem anterior sem desfazer migration automaticamente.

Migrations destrutivas precisam seguir expansão e contração: primeiro adicionar estrutura compatível, depois publicar o código e somente em outra versão remover campos antigos.

## Backup e restauração

- backup da Hostinger protege a máquina, mas não substitui backup do Supabase;
- executar backup do PostgreSQL antes de migrations relevantes;
- guardar cópia criptografada fora da VPS;
- testar restauração em ambiente isolado;
- documentar tempo e ponto de recuperação esperados;
- não considerar backup válido sem teste de restauração.

## Monitoramento

Monitorar CPU, RAM, swap, disco, carga, reinícios, tempo de resposta, erros HTTP, tamanho e idade das filas e falhas dos workers.

Alertas iniciais:

- CPU acima de 70% de forma sustentada;
- RAM acima de 75%;
- disco acima de 70%;
- uso recorrente de swap;
- healthcheck indisponível;
- crescimento contínuo da fila;
- jobs sem confirmação ou com repetidas falhas.

## Critério de upgrade

Subir para 4 vCPU se CPU ou filas permanecerem saturadas após otimização. Aumentar RAM somente com evidência de pressão de memória. Se o gargalo estiver em consultas, conexões ou I/O, aumentar o compute do Supabase em vez da VPS.

## Checklist de abertura

- domínio e HTTPS válidos;
- SSH por chave e firewall testados;
- backups diário e externo ativos;
- restauração ensaiada;
- migrations aplicadas;
- build aprovado;
- RLS testado por perfil;
- credenciais demo removidas ou protegidas;
- SMTP e recuperação de senha configurados;
- logs sem dados sensíveis;
- monitoramento e alertas recebidos;
- política de privacidade e procedimentos LGPD publicados;
- teste de carga com os fluxos reais concluído.
