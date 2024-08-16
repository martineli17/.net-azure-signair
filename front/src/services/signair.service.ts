import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export function createSignairConnection(endpoint: string): HubConnection {
    const connect = new HubConnectionBuilder()
        .withUrl(endpoint)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

    return connect;
}