# ⚡ Guide Rapide: Synchronisation Temps Réel

## 🚀 Démarrage Rapide (5 minutes)

### 1. Activer la Synchronisation Temps Réel (Frontend)

#### Ajouter le Provider au Layout Principal

```typescript
// apps/web/src/app/layout.tsx
import { RealtimeSyncProvider } from '@/providers/RealtimeSyncProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {/* ✅ AJOUTEZ CECI */}
          <RealtimeSyncProvider>
            {children}
          </RealtimeSyncProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

**C'est tout! La synchronisation temps réel est maintenant active sur toute l'app.** 🎉

---

### 2. Utiliser les Mutations avec Invalidation Automatique

#### Avant (sans sync automatique)
```typescript
const createProject = useMutation({
  mutationFn: (data) => projectsAPI.create(data),
  // ❌ Pas de mise à jour automatique
});
```

#### Après (avec sync automatique)
```typescript
import { useMutationWithInvalidation } from '@/hooks/useMutationWithInvalidation';

const createProject = useMutationWithInvalidation({
  mutationFn: (data) => projectsAPI.create(data),
  invalidateKeys: ['projects', 'dashboard'], // ✅ Invalide automatiquement
  onSuccess: (project) => {
    toast.success(`Project ${project.name} created!`);
  },
});
```

**Résultat**: Les données sont automatiquement rafraîchies après la mutation!

---

### 3. Émettre des Événements WebSocket (Backend)

#### Dans vos endpoints FastAPI

```python
from app.core.realtime_events import emit_project_created, emit_project_updated, emit_project_deleted

@router.post("/projects")
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user)
):
    # Créer le projet
    new_project = await projects_service.create(project, current_user)
    
    # ✅ ÉMETTRE L'ÉVÉNEMENT WEBSOCKET
    await emit_project_created(
        project_id=new_project.id,
        project_data={"name": new_project.name, "description": new_project.description},
        exclude_user_id=str(current_user.id)  # Ne pas notifier le créateur
    )
    
    return new_project
```

**Résultat**: Tous les clients connectés reçoivent instantanément la mise à jour!

---

## 📚 Exemples Complets

### Exemple 1: CRUD avec Synchronisation Automatique

```typescript
// apps/web/src/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { useMutationWithInvalidation } from '@/hooks/useMutationWithInvalidation';
import { projectsAPI } from '@/lib/api';

export function useProjects() {
  // Query avec auto-refetch
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.list(),
  });

  // Create avec invalidation auto
  const createProject = useMutationWithInvalidation({
    mutationFn: (data) => projectsAPI.create(data),
    invalidateKeys: ['projects', 'dashboard'],
  });

  // Update avec invalidation auto
  const updateProject = useMutationWithInvalidation({
    mutationFn: ({ id, data }) => projectsAPI.update(id, data),
    invalidateKeys: ['projects', 'project', 'dashboard'],
  });

  // Delete avec invalidation auto
  const deleteProject = useMutationWithInvalidation({
    mutationFn: (id) => projectsAPI.delete(id),
    invalidateKeys: ['projects', 'dashboard'],
  });

  return {
    projects: data,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
  };
}
```

#### Usage dans un Composant
```typescript
function ProjectsList() {
  const { projects, isLoading, createProject, deleteProject } = useProjects();

  const handleCreate = () => {
    createProject.mutate({ name: 'New Project' });
    // ✅ La liste se met à jour automatiquement!
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      {projects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project}
          onDelete={() => deleteProject.mutate(project.id)}
          // ✅ Se met à jour automatiquement après delete!
        />
      ))}
      <Button onClick={handleCreate}>Create Project</Button>
    </div>
  );
}
```

---

### Exemple 2: Notifications Temps Réel

```typescript
// apps/web/src/hooks/useNotifications.ts
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';

export function useNotifications() {
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.list(),
  });

  // Écouter les nouvelles notifications via WebSocket
  const { lastMessage } = useWebSocket('/api/ws/notifications', {
    onMessage: (message) => {
      if (message.type === 'notification_created') {
        // ✅ Refetch automatique
        refetch();
        
        // Afficher toast
        toast.info(message.data.title);
      }
    },
  });

  return {
    notifications: data,
    lastMessage,
  };
}
```

---

### Exemple 3: Collaboration Temps Réel (Multi-utilisateurs)

```typescript
// apps/web/src/hooks/useCollaboration.ts
import { useWebSocket } from '@/hooks/useWebSocket';

export function useCollaboration(projectId: string) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const { send, lastMessage } = useWebSocket(
    `/api/ws/room/project:${projectId}`,
    {
      onMessage: (data) => {
        switch (data.type) {
          case 'user_joined':
            setActiveUsers(prev => [...prev, data.user]);
            break;
          case 'user_left':
            setActiveUsers(prev => prev.filter(u => u.id !== data.user_id));
            break;
          case 'document_updated':
            // ✅ Synchroniser le document en temps réel
            queryClient.invalidateQueries(['project', projectId]);
            break;
        }
      },
    }
  );

  const broadcastUpdate = (update: any) => {
    send({
      type: 'document_updated',
      data: update,
    });
  };

  return {
    activeUsers,
    broadcastUpdate,
    lastMessage,
  };
}
```

---

## 🔧 Configuration Backend

### 1. Modifier le Cache Headers

```python
# backend/app/core/cache_headers.py
from app.core.realtime_config import get_cache_max_age

class CacheHeadersMiddleware(BaseHTTPMiddleware):
    def _get_cache_max_age(self, path: str) -> int:
        # ✅ UTILISER LA CONFIGURATION TEMPS RÉEL
        return get_cache_max_age(path)
```

### 2. Désactiver le Cache Redis pour Endpoints Temps Réel

```python
# backend/app/core/cache.py
from app.core.realtime_config import should_cache_endpoint

@cached(expire=300, key_prefix="users")
async def get_users():
    # ❌ NE PAS utiliser @cached sur endpoints temps réel!
    ...

# ✅ À LA PLACE:
async def get_users():
    # Pas de cache, données toujours fraîches
    return await db.execute(select(User))
```

---

## 🎯 Checklist de Mise en Production

### Frontend
- [x] `RealtimeSyncProvider` ajouté au layout
- [x] `useMutationWithInvalidation` utilisé pour toutes les mutations
- [x] `staleTime: 0` dans `queryClient.ts`
- [x] `export const dynamic = 'force-dynamic'` sur pages dashboard
- [ ] Tests de reconnexion WebSocket
- [ ] Tests multi-onglets

### Backend
- [ ] `emit_event()` appelé après chaque mutation (CREATE, UPDATE, DELETE)
- [ ] Cache désactivé sur endpoints temps réel (voir `realtime_config.py`)
- [ ] `Cache-Control: no-cache` sur endpoints temps réel
- [ ] Tests de charge WebSocket (100+ connexions)
- [ ] Monitoring des connexions WebSocket

---

## 📊 Métriques de Performance

Après implémentation complète:

| Métrique | Valeur Cible | Status |
|----------|--------------|--------|
| Latence Mutation → Backend | < 100ms | ⚡ |
| Latence Backend → WebSocket | < 50ms | ⚡ |
| Latence WebSocket → Frontend | < 50ms | ⚡ |
| **Total: Mutation → Affichage** | **< 200ms** | ✅ |
| Reconnexion automatique | < 3s | ✅ |
| Support multi-onglets | Oui | ✅ |

---

## 🐛 Troubleshooting

### Problème: Les données ne se mettent pas à jour

**Solution 1**: Vérifier que `RealtimeSyncProvider` est bien ajouté
```typescript
// apps/web/src/app/layout.tsx
<RealtimeSyncProvider>
  {children}
</RealtimeSyncProvider>
```

**Solution 2**: Vérifier les query keys dans l'invalidation
```typescript
// Doit correspondre aux query keys utilisées
invalidateKeys: ['projects'] // ✅
// vs
queryKey: ['projects'] // ✅ Correspond!
```

**Solution 3**: Vérifier que l'événement WebSocket est émis
```python
# Backend
await emit_project_created(project.id, project_data)
```

### Problème: WebSocket se déconnecte

**Solution**: Auto-reconnect est activé par défaut
```typescript
const { isConnected, reconnect } = useWebSocket('/api/ws/notifications', {
  autoReconnect: true, // ✅ Activé par défaut
  reconnectInterval: 3000,
});

// Forcer reconnexion manuelle si besoin
if (!isConnected) {
  reconnect();
}
```

### Problème: Cache persiste malgré invalidation

**Solution**: Forcer no-cache dans Next.js
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
```

---

## 🎓 Ressources

- [Documentation Complète](./REAL_TIME_SYNC_ANALYSIS.md)
- [React Query Docs](https://tanstack.com/query/latest)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Next.js Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering)

---

**Prêt à synchroniser en temps réel?** 🚀

Commencez par l'étape 1 et suivez le guide!
