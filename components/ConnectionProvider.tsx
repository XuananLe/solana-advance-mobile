import {Cluster, Connection, ConnectionConfig, clusterApiUrl} from '@solana/web3.js';
import React, {ReactNode, createContext, useContext, useMemo} from 'react';

export interface ConnectionProviderProps {
  children: ReactNode;
  cluster: Cluster;
  endpoint?: string;
  config?: ConnectionConfig;
}

export interface ConnectionContextState {
  connection: Connection;
  cluster: Cluster;
}

const ConnectionContext = createContext<ConnectionContextState>(
  {} as ConnectionContextState,
);

export function ConnectionProvider(props: ConnectionProviderProps){
  const {children, cluster, endpoint, config = {commitment: 'confirmed'}} = props;

  const rpcUrl = endpoint ?? clusterApiUrl(cluster);

  const connection = useMemo(
    () => new Connection(rpcUrl, config),
    [config, rpcUrl],
  );

  const value = {
    connection,
    cluster,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = (): ConnectionContextState =>
  useContext(ConnectionContext);