import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://kc.localhost:8081',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'csh',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;