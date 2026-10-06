# Cidade Limpa

Protótipo de um portal de participação cidadã para Cerro Corá, feito com HTML, CSS e JavaScript, sem dependências.

## Como executar

Abra `index.html` em um navegador atualizado. Para desenvolvimento, você também pode utilizar o Live Server do VS Code.

## Funcionalidades

- Perfil local com nome e e-mail, sem senha ou autenticação.
- Registro de descarte irregular com endereço, descrição e foto opcional (JPG, PNG ou WebP até 2 MB).
- Acompanhamento local: concluir, reabrir e remover registros.
- Orientações de conscientização e separação dos recicláveis.
- Layout responsivo, navegação por teclado e mensagens acessíveis.

Os dados são armazenados no `localStorage` do navegador. Não há servidor, envio à prefeitura ou sincronização entre dispositivos. Limpar os dados do navegador apaga os registros. Evite inserir dados pessoais nas fotos e descrições.

## Revisão realizada

O código anterior armazenava senhas em texto puro e interpolava entradas do usuário no HTML. Esta revisão remove as senhas legadas, escapa o conteúdo exibido, valida fotos, trata falhas de armazenamento e aguarda a leitura da imagem antes de salvar. O acompanhamento de status representa apenas a organização pessoal dos registros.

## Próximas etapas

Para operar como serviço municipal, será necessário definir o canal responsável pelo atendimento, implementar uma API com banco de dados e autenticação, e permitir que somente pessoas autorizadas atualizem o status oficial. O protótipo atual não oferece essas funções.

## Verificação

Execute `node --check script.js` e `node --test tests/*.test.cjs`.

A interface inclui navegação direta, resumo dos registros, busca por endereço ou descrição, filtro por status, contador de caracteres e remoção da foto antes de salvar.
