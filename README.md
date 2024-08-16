# Azure SignaIr

O Azure SignaIr é um serviço disponiblizado pela Azure para gerenciar as conexões e mensagens websockets das aplicações.

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
Neste exemplo, foi criada uma aplicação frontend que iniciará a conexão websocket. Para isso, é preciso indicar qual é o host que deseja utilizar para esta comunicação e, posteriormente, enviar mensagens para testes.
Além disso, há uma aplicação backend na qual receberá as solicitações websockets (utilizando o pacote SignaIr do .NET) e processará as mensagens. 
Na aplicação backend, há um parâmetro de configuração para definir se irá utilizar o Azure SignaIr ou se irá manter o gerencimento no próprio host.

