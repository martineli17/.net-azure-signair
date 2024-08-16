'use client'

import { createSignairConnection } from "@/services/signair.service";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [signairConnection, setSignairConnection] = useState<HubConnection>();
  const [signairMessagePayload, setSignairMessagePayload] = useState<any>({});
  const endpointSignairRef = useRef<HTMLInputElement>(null);
  const signairMessageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(signairConnection?.state === HubConnectionState.Connected){
      signairConnection.onclose(() => setSignairMessagePayload('Conexão fechada'));
      signairConnection.onreconnecting(() => setSignairMessagePayload('Reconectando conexão...'));
      signairConnection.onreconnected(() => setSignairMessagePayload('Conexão reconectada'));
      signairConnection.on('NewMessage', (payload) => setSignairMessagePayload(payload));
    }
  }, [signairConnection]);

  async function handleStartSignair(): Promise<void> {
    if(endpointSignairRef?.current){
      const connection = createSignairConnection(endpointSignairRef.current.value);
      await connection.start();
      setSignairConnection(connection);
    }
  }

  async function handleSendMessage(): Promise<void> {
    if(signairMessageRef?.current?.value){
      await signairConnection?.send('SendMessageAsync', signairMessageRef.current.value);
    }
  }

  return (
    <main>
      <input type="text" ref={endpointSignairRef} />
      <button onClick={handleStartSignair}>Iniciar SignaIR</button>
      <hr/>
      <input type="text" ref={signairMessageRef} />
      <button onClick={handleSendMessage}>Enviar mensagem</button>
      <hr/>
      <p>Data Mensagem: {signairMessagePayload.payload?.date} | Conteúdo Mensagem: {signairMessagePayload.payload?.data}</p>
    </main>
  );
}
