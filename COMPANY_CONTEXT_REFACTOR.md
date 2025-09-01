# Contexto de Empresa Refactorizado con Socket.IO

## Descripción

El contexto de la empresa ha sido completamente refactorizado para funcionar de manera más eficiente con Socket.IO, mejorando la organización del código y la gestión del estado en tiempo real.

## Características Principales

### 1. Gestión de Estado Mejorada
- **Reducer optimizado**: Manejo más granular del estado con acciones específicas
- **Funciones memoizadas**: Uso de `useCallback` para evitar re-renders innecesarios
- **Separación de responsabilidades**: Estado, loading y errores manejados por separado

### 2. Integración con Socket.IO
- **Conexión automática**: Se conecta automáticamente cuando hay un token válido
- **Eventos en tiempo real**: Escucha cambios de servicios, citas y disponibilidad
- **Manejo de errores**: Gestión robusta de errores de conexión
- **Reconexión automática**: Intenta reconectar automáticamente si se pierde la conexión

### 3. Funciones Disponibles

#### Gestión de Datos
- `fetchCompanyData()`: Obtiene los datos de la empresa desde el servidor
- `clearError()`: Limpia los errores del contexto

#### Gestión de Servicios
- `updateServices(services)`: Actualiza la lista completa de servicios
- `addService(service)`: Agrega un nuevo servicio
- `deleteService(serviceId)`: Elimina un servicio por ID

#### Gestión de Citas
- `updateAppointments(appointments)`: Actualiza la lista completa de citas
- `addAppointment(appointment)`: Agrega una nueva cita
- `deleteAppointment(appointmentId)`: Elimina una cita por ID

#### Gestión de Disponibilidad
- `updateServiceAvailability(serviceId, availableAppointments)`: Actualiza la disponibilidad de un servicio

## Uso del Hook Personalizado

```typescript
import { useCompany } from '../hooks/useCompany';

const MyComponent = () => {
    const { 
        state, 
        isLoading, 
        error, 
        addService, 
        deleteService,
        addAppointment,
        clearError 
    } = useCompany();

    // Usar las funciones del contexto
    const handleAddService = (newService) => {
        addService(newService);
    };

    return (
        <div>
            {isLoading && <p>Cargando...</p>}
            {error && <p>Error: {error}</p>}
            <p>Empresa: {state.name}</p>
        </div>
    );
};
```

## Eventos de Socket.IO

### Eventos Recibidos del Servidor
- `company:service-added`: Nuevo servicio agregado
- `company:service-deleted`: Servicio eliminado
- `company:service-updated`: Servicio actualizado
- `company:appointment-added`: Nueva cita agregada
- `company:appointment-deleted`: Cita eliminada
- `company:appointment-updated`: Cita actualizada
- `company:availability-updated`: Disponibilidad actualizada

### Eventos Enviados al Servidor
- `auth:login`: Autenticación del socket
- `auth:logout`: Desconexión del socket
- `service:create`: Crear nuevo servicio
- `service:update`: Actualizar servicio
- `service:delete`: Eliminar servicio
- `appointment:create`: Crear nueva cita
- `appointment:update`: Actualizar cita
- `appointment:delete`: Eliminar cita
- `availability:update`: Actualizar disponibilidad

## Configuración de Socket.IO

### Configuración del Cliente
```typescript
const socketConfig = {
    transports: ["websocket", "polling"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
};
```

### Funciones de Utilidad
- `connectSocket(token)`: Conecta el socket con autenticación
- `disconnectSocket()`: Desconecta el socket
- `isSocketConnected()`: Verifica si está conectado
- `emitSocketEvent(event, data)`: Emite eventos con manejo de errores

## Mejoras Implementadas

### 1. Organización del Código
- Separación clara de tipos, interfaces y lógica
- Uso de `useCallback` para optimizar rendimiento
- Manejo de errores más robusto

### 2. Gestión de Estado
- Reducer más específico con acciones granulares
- Estado de loading y error separado del estado principal
- Funciones específicas para cada operación

### 3. Integración con Socket.IO
- Conexión automática con autenticación
- Eventos tipados para mejor mantenimiento
- Manejo de reconexión automática
- Limpieza de listeners al desmontar

### 4. Experiencia de Desarrollo
- Hook personalizado `useCompany` para facilitar el uso
- Tipos TypeScript completos
- Documentación clara y ejemplos de uso

## Migración desde la Versión Anterior

### Cambios en las Funciones
- `deleteService` ahora recibe un `serviceId` en lugar de un array de servicios
- `deleteAppointment` ahora recibe un `appointmentId` en lugar de un array de citas
- Nuevas funciones: `addService`, `addAppointment`, `updateServiceAvailability`, `clearError`

### Nuevas Funcionalidades
- Integración automática con Socket.IO
- Gestión de errores mejorada
- Estado de loading independiente
- Funciones memoizadas para mejor rendimiento

## Consideraciones de Rendimiento

1. **Memoización**: Todas las funciones están memoizadas con `useCallback`
2. **Dependencias**: Los `useEffect` tienen dependencias específicas para evitar re-ejecuciones innecesarias
3. **Limpieza**: Los listeners de Socket.IO se limpian automáticamente al desmontar
4. **Reconexión**: Configuración optimizada para reconexión automática

## Próximos Pasos

1. Implementar el backend con Socket.IO para manejar los eventos
2. Agregar notificaciones en tiempo real
3. Implementar sincronización de estado entre múltiples clientes
4. Agregar métricas de rendimiento y monitoreo 