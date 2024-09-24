// import { Cluster, PublicKey } from '@solana/web3.js';
// import {
//     Account as AuthorizedAccount,
//     AuthorizationResult,
//     AuthorizeAPI,
//     AuthToken,
//     Base64EncodedAddress,
//     DeauthorizeAPI,
//     ReauthorizeAPI,
// } from '@solana-mobile/mobile-wallet-adapter-protocol';
// import { toUint8Array } from 'js-base64';
// import { useState, useCallback, useMemo, ReactNode } from 'react';
// import React from 'react';
// import { APP_IDENTITY, Account } from '../utils/useAuthorization';


// type Authorization = Readonly<{
//     accounts: Account[];
//     authToken: AuthToken;
//     selectedAccount: Account;
// }>;

// export type AuthorizationProviderContext = {
//     accounts: Account[] | null;
//     authorizeSession: (wallet: AuthorizeAPI & ReauthorizeAPI) => Promise<Account>;
//     deauthorizeSession: (wallet: DeauthorizeAPI) => void;
//     onChangeAccount: (nextSelectedAccount: Account) => void;
//     selectedAccount: Account | null;
// };

// const AuthorizationContext = React.createContext<AuthorizationProviderContext>({
//     accounts: null,
//     authorizeSession: (_wallet: AuthorizeAPI & ReauthorizeAPI) => {
//         throw new Error('Provider not initialized');
//     },
//     deauthorizeSession: (_wallet: DeauthorizeAPI) => {
//         throw new Error('Provider not initialized');
//     },
//     onChangeAccount: (_nextSelectedAccount: Account) => {
//         throw new Error('Provider not initialized');
//     },
//     selectedAccount: null,
// });

// export type AuthProviderProps = {
//     children: ReactNode;
//     cluster: Cluster;
// };

// function getPublicKeyFromAddress(address: Base64EncodedAddress): PublicKey {
//     return new PublicKey(toUint8Array(address));
// }

// function getAccountFromAuthorizedAccount(authAccount: AuthorizedAccount): Account {
//     return {
//         ...authAccount,
//         publicKey: getPublicKeyFromAddress(authAccount.address),
//     };
// }

// function getAuthorizationFromAuthResult(
//     authResult: AuthorizationResult,
//     previousAccount?: Account,
// ): Authorization {
//     let selectedAccount: Account;
//     if (
//         previousAccount == null ||
//         !authResult.accounts.some(
//             ({ address }) => address === previousAccount.address,
//         )
//     ) {
//         const firstAccount = authResult.accounts[0];
//         selectedAccount = getAccountFromAuthorizedAccount(firstAccount);
//     } else {
//         selectedAccount = previousAccount;
//     }
//     return {
//         accounts: authResult.accounts.map(getAccountFromAuthorizedAccount),
//         authToken: authResult.auth_token,
//         selectedAccount,
//     };
// }

// export function AuthorizationProvider(props: AuthProviderProps) {
//     const { children, cluster } = props;
//     const [authorization, setAuthorization] = useState<Authorization | null>(null);

//     const handleAuthorizationResult = useCallback(
//         async (authResult: AuthorizationResult): Promise<Authorization> => {
//             const nextAuthorization = getAuthorizationFromAuthResult(
//                 authResult,
//                 authorization?.selectedAccount,
//             );
//             setAuthorization(nextAuthorization);
//             return nextAuthorization;
//         },
//         [authorization, setAuthorization],
//     );

//     const authorizeSession = useCallback(
//         async (wallet: AuthorizeAPI & ReauthorizeAPI) => {
//             const authorizationResult = await (authorization
//                 ? wallet.reauthorize({
//                     auth_token: authorization.authToken,
//                     identity: APP_IDENTITY,
//                 })
//                 : wallet.authorize({ identity: APP_IDENTITY }));
//             return (await handleAuthorizationResult(authorizationResult))
//                 .selectedAccount;
//         },
//         [authorization, handleAuthorizationResult],
//     );

//     const deauthorizeSession = useCallback(
//         async (wallet: DeauthorizeAPI) => {
//             if (authorization?.authToken == null) {
//                 return;
//             }
//             await wallet.deauthorize({ auth_token: authorization.authToken });
//             setAuthorization(null);
//         },
//         [authorization, setAuthorization],
//     );

//     const onChangeAccount = useCallback(
//         (nextAccount: Account) => {
//             setAuthorization(currentAuthorization => {
//                 if (
//                     !currentAuthorization?.accounts.some(
//                         ({ address }) => address === nextAccount.address,
//                     )
//                 ) {
//                     throw new Error(`${nextAccount.address} is no longer authorized`);
//                 }
//                 return { ...currentAuthorization, selectedAccount: nextAccount };
//             });
//         },
//         [setAuthorization],
//     );

//     const value = useMemo(
//         () => ({
//             accounts: authorization?.accounts ?? null,
//             authorizeSession,
//             deauthorizeSession,
//             onChangeAccount,
//             selectedAccount: authorization?.selectedAccount ?? null,
//         }),
//         [authorization, authorizeSession, deauthorizeSession, onChangeAccount],
//     );

//     return (
//         <AuthorizationContext.Provider value={value}>
//             {children}
//         </AuthorizationContext.Provider>
//     );
// }

