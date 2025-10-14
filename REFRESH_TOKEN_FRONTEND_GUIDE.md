# Guía de Refresh Tokens - Frontend

## Descripción
Se ha implementado un sistema completo de refresh tokens en el frontend que maneja automáticamente la renovación de tokens cuando expiran, mejorando significativamente la experiencia del usuario.

## Archivos Creados/Modificados

### Nuevos Archivos
- `src/utils/tokenManager.ts` - Gestión centralizada de tokens
- `src/hooks/useAuthenticatedFetch.ts` - Hook para requests autenticadas con manejo automático de refresh
- `src/components/LogoutButton/LogoutButton.tsx` - Componente de logout mejorado

### Archivos Modificados
- `src/contexts/CompanyContext.tsx` - Actualizado para usar el nuevo sistema de autenticación
- `src/components/LoginRegisterForms/FormLogin/FormLogin.tsx` - Manejo de ambos tokens en login
- `src/components/LoginRegisterForms/FormRegister/FormRegister.tsx` - Manejo de ambos tokens en registro
- `src/components/UserCompanyPanels/CompanyPanel/CompanyInterface/HistoryPanel/HistoryPanel.tsx` - Ejemplo de migración

## Funcionalidades Implementadas

### 1. Gestión Centralizada de Tokens (`tokenManager.ts`)

```typescript
import { setTokens, getAccessToken, getRefreshToken, clearTokens, refreshAccessToken, logout } from '../utils/tokenManager';

// Almacenar tokens
setTokens({ access_token: "token1", refresh_token: "token2" });

// Obtener tokens
const accessToken = getAccessToken();
const refreshToken = getRefreshToken();

// Limpiar tokens
clearTokens();

// Renovar access token
const newTokens = await refreshAccessToken();

// Logout completo
await logout();
```

### 2. Hook de Fetch Autenticado (`useAuthenticatedFetch.ts`)

#### Hook Principal
```typescript
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch();

// Request con manejo automático de refresh
const response = await fetchWithAuth('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

#### Hooks Especializados
```typescript
import { useAuthenticatedGet, useAuthenticatedPost, useAuthenticatedPut, useAuthenticatedDelete } from '../hooks/useAuthenticatedFetch';

// GET requests
const { get } = useAuthenticatedGet();
const response = await get('/api/endpoint');

// POST requests
const { post } = useAuthenticatedPost();
const response = await post('/api/endpoint', data);

// PUT requests
const { put } = useAuthenticatedPut();
const response = await put('/api/endpoint', data);

// DELETE requests
const { delete: del } = useAuthenticatedDelete();
const response = await del('/api/endpoint');
```

### 3. Manejo Automático de Refresh

El sistema maneja automáticamente:

1. **Detección de Token Expirado**: Cuando el backend devuelve `401` con `code: "TOKEN_EXPIRED"`
2. **Renovación Automática**: Usa el refresh token para obtener nuevos tokens
3. **Reintento de Request**: Reintenta la request original con el nuevo access token
4. **Manejo de Errores**: Si el refresh falla, redirige al login

### 4. Flujo de Autenticación

#### Login
```typescript
// En FormLogin.tsx
const response = await post(url, dataForm, { skipAuth: true });

if (response.data) {
  if (loginTo === "company" && response.data.access_token && response.data.refresh_token) {
    setTokens({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token
    });
  }
}
```

#### Requests Autenticadas
```typescript
// Automático - no necesitas hacer nada especial
const response = await fetchWithAuth('/api/protected-endpoint');

if (response.error && response.code === "SESSION_EXPIRED") {
  // El sistema ya redirigió al login automáticamente
}
```

#### Logout
```typescript
import LogoutButton from '../components/LogoutButton/LogoutButton';

// Componente listo para usar
<LogoutButton onLogout={() => console.log('Sesión cerrada')}>
  Cerrar Sesión
</LogoutButton>

// O manualmente
await logout();
```

## Migración de Código Existente

### Antes (usando useFetchData)
```typescript
import { useFetchData } from "../hooks/useFetchData";

const { isLoading, error, fetchData } = useFetchData(url, "GET", token);

const response = await fetchData({});
```

### Después (usando useAuthenticatedFetch)
```typescript
import { useAuthenticatedGet } from "../hooks/useAuthenticatedFetch";

const { isLoading, error, get } = useAuthenticatedGet();

const response = await get(url);
```

### Requests con fetch directo
```typescript
// Antes
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
});

// Después
const response = await fetchWithAuth(url);
```

## Opciones de Configuración

### Fetch Options
```typescript
const response = await fetchWithAuth(url, {
  skipAuth: true,              // Omitir autenticación (para login/register)
  retryOnTokenExpired: false,  // No reintentar automáticamente
  method: 'POST',
  headers: { 'Custom-Header': 'value' },
  body: JSON.stringify(data)
});
```

## Manejo de Errores

### Códigos de Error
- `TOKEN_EXPIRED`: Access token expirado (manejado automáticamente)
- `SESSION_EXPIRED`: Refresh token inválido (redirige al login)

### Ejemplo de Manejo
```typescript
const response = await fetchWithAuth('/api/endpoint');

if (response.error) {
  if (response.code === "SESSION_EXPIRED") {
    // Ya redirigido automáticamente al login
    return;
  }
  
  // Otros errores
  console.error('Error:', response.error);
}
```

## Integración con Contextos

### CompanyContext Actualizado
```typescript
// Automáticamente maneja refresh de tokens
const { get } = useAuthenticatedGet();

const fetchCompanyData = useCallback(async () => {
  const response = await get(`${BACKEND_API_URL}/companies/get-company`);
  
  if (response.code === "SESSION_EXPIRED") {
    // Redirige automáticamente al login
    return;
  }
  
  // Usar response.data normalmente
}, [get]);
```

## Beneficios

1. **Experiencia de Usuario Mejorada**: No más interrupciones por tokens expirados
2. **Seguridad**: Tokens rotan automáticamente
3. **Mantenibilidad**: Lógica centralizada de autenticación
4. **Simplicidad**: Los desarrolladores no necesitan manejar refresh manualmente
5. **Compatibilidad**: Funciona con el sistema existente

## Consideraciones

- El sistema es compatible con el backend existente
- Los usuarios mantienen el mismo comportamiento
- Las empresas ahora tienen refresh tokens automáticos
- Los usuarios regulares siguen usando solo access tokens
- El sistema es transparente para la mayoría del código existente

## Próximos Pasos

1. Migrar gradualmente otros componentes que usan `useFetchData`
2. Actualizar otros formularios y componentes de autenticación
3. Considerar implementar refresh tokens para usuarios también
4. Agregar tests para el nuevo sistema de autenticación
