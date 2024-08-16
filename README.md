# Azure SignaIr

O Azure SignaIr é um serviço disponiblizado pela Azure para gerenciar as conexões e mensagens websockets das aplicações.

Além disso, permite criar soluções [Serveless - Functions](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-concept-serverless-development-config?tabs=isolated-process) para comunicação websocket, assim os eventos podem ter um listener para serem disparados somente quando necessário.

Isso é possível pois, como dito anteriormente, o gerencimento das conexões fica como responsabilidade do serviço da Azure, estando acessível em qualquer host que tenha acesso ao serviço.

## Contexto de uso

Uma aplicação que utiliza o SignaIr (websocket) tem o gerenciamento das conexões e das mensagens armazenadas dentro do host que está executando aquele processo.
Com isso, quando o usuário inicia o processo de comunicação websocket, a sua conexão fica restrita ao host que recebeu essa solicitação e, consequentemente, todo o processamento que necessita enviar eventos para este usuário precisa ser executado por este host específico.
Esse cenário se torna um obstáculo pois as aplicações atuais (principalmente utilizando Kubernetes) tem a capacidade e necessidade de realizar a escalabilidade visando aumentar ou diminuir a capacidade de processamento de acordo com a demanda atual de trabalho. 
Tendo isso em mente, pode ocorrer o seguinte cenário:
1. Usuário inicia a conexão websocket e o Pod 01 recebe esse requisição.
2. A aplicação aumenta a sua capacidade de processamento para 02 pods.
3. Ocorre um determinado fluxo de trabalho que dispara um processamento no Pod 02 para notificar o usuário através websocket.
4. O usuário não receberá essa notificação pois a conexão dele está sendo gerenciada pelo Pod 01.

Isso se torna um problema pois mesmo havendo o processamento correto do fluxo, o usuário não receberá o retorno do evento esperado.

## Soluções
Para contornar este problema, existe algumas soluções que tem o objetivo de gerenciar e armazenar as conexões e mensagens, sendo possível compartilhar estas informações entre os hosts disponíveis para o processamento.
Dentre as soluções, há disponível:
- Azure SignaIr (utilizado neste exemplo)
- Redis para itilização de uma camada de cache

## Exemplo

### Aplicação frontend
Foi criada uma aplicação frontend que iniciará a conexão websocket. Para isso, é preciso indicar qual é o host que deseja utilizar para esta comunicação e, posteriormente, enviar mensagens para testes.

[Arquivo](https://github.com/martineli17/.net-azure-signair/blob/master/front/)

### Aplicação backend - API
Há uma aplicação backend na qual receberá as solicitações websockets (utilizando o pacote SignaIr do .NET) e processará as mensagens. 
Na aplicação backend, há um parâmetro de configuração para definir se irá utilizar o Azure SignaIr ou se irá manter o gerencimento no próprio host.

[Arquivo](https://github.com/martineli17/.net-azure-signair/blob/master/AzureSignaIR/)

Para indicar que o Azure SignaIr ficará responsável por gerenciar as conexões, basta adicionar a configuração durante as adições dos serviços da aplicação:

```csharp
    builder.Services.AddSignalR().AddAzureSignalR(opt =>
    {
        opt.ApplicationName = "App01";
        opt.ConnectionString = builder.Configuration.GetConnectionString("AzureSignaIR");
    });
```

Nesse código, é informado a connection string  para o serviço da Azure e também o nome da aplicação. O nome da aplicação seria necessário caso haja mais de uma utilizando este mesmo serviço. Com isso, o Azure irá adicionar um prefixo no gerenciamento dos hubs para identificação de qual aplicação o mesmo pertence.

### Deployment
Foi utilizando o Kubernetes para a criação de 2 pods e posteriormente utilizar, através do `port forward`, no frontend para que ele se conecte separadamente em cada um deles a fim de simular o processamento em hosts distintos.

[Arquivo](https://github.com/martineli17/.net-azure-signair/blob/master/AzureSignaIR/deployment.yml)

### Testando o funcionamento
- Processamento no mesmo POD: o usuário recebe todas os eventos, pois o processamento ocorreu no POD em que a sua conexão foi iniciada.

![hub_mesmo_pod](https://github.com/user-attachments/assets/4c2d7a9e-487d-4aec-b529-36e18c695f3d)

- Sem a utilização do Azure SignaIr: note que quando o usuário é conectado no POD 01 e envia a mensagem através dele, o POD 02 não processa a mensagem e o usuário não recebe esse novo evento. E o inverso também.

![hub_sem_azure_signair](https://github.com/user-attachments/assets/ac378c3f-ece0-4a26-ba6b-349bd78f4e54)

- Com a utilização do Azure SignaIr: independemente de qual POD processou a mensagem, o usuário recebe o novo evento, não perdendo nenhuma atualização.

![hub_com_azure_signair](https://github.com/user-attachments/assets/b5fc2165-e0af-48f3-96b6-6469261412f7)


