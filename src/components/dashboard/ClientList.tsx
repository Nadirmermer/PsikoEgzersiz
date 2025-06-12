
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Activity, User, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClientInfo {
  client_identifier: string
  last_activity: string
  total_exercises: number
  is_client_mode: boolean
  client_mode_sessions: number
  anonymous_sessions: number
  average_score: number
  best_score: number
}

interface ClientListProps {
  clients: ClientInfo[]
  selectedClient: string | null
  onClientSelect: (clientId: string) => void
  loading: boolean
}

const ClientList: React.FC<ClientListProps> = ({
  clients,
  selectedClient,
  onClientSelect,
  loading
}) => {
  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-2" aria-label="Danışan listesi yükleniyor">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="animate-pulse h-20 bg-muted rounded-lg"
          aria-hidden="true"
        />
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-8 space-y-4">
      <Users 
        className="h-12 w-12 mx-auto text-muted-foreground" 
        aria-hidden="true"
      />
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          Henüz Danışan Verisi Bulunmuyor
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Danışanlar egzersiz yapmaya başladığında burada görünecekler.
        </p>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg text-left space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Veri eklemek için:</p>
          <p className="text-xs text-muted-foreground">• Danışan modunu kullanarak egzersiz yaptırın</p>
          <p className="text-xs text-muted-foreground">• Danışanlarınızın uzman ID'nizle bağlanmasını sağlayın</p>
        </div>
      </div>
    </div>
  );

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Bugün';
    } else if (diffDays === 2) {
      return 'Dün';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return (
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            Danışanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            Danışanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" aria-hidden="true" />
          <span>Danışanlar ({clients.length})</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Danışan detaylarını görüntülemek için listeden birini seçin
        </p>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-3"
          role="listbox"
          aria-label="Danışan listesi"
          aria-activedescendant={selectedClient ? `client-${selectedClient}` : undefined}
        >
          {clients.map((client) => {
            const isSelected = selectedClient === client.client_identifier;
            const hasMultipleSources = client.client_mode_sessions > 0 && client.anonymous_sessions > 0;
            
            return (
              <Button
                key={client.client_identifier}
                id={`client-${client.client_identifier}`}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-4 text-left transition-all duration-300 focus-enhanced",
                  isSelected && "bg-primary text-primary-foreground shadow-md scale-[1.02]",
                  !isSelected && "hover:bg-accent/50 hover:scale-[1.01]"
                )}
                onClick={() => onClientSelect(client.client_identifier)}
                role="option"
                aria-selected={isSelected}
                aria-describedby={`client-desc-${client.client_identifier}`}
              >
                <div className="flex-1 space-y-3">
                  {/* Üst kısım - İsim ve Ana Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected 
                          ? "bg-primary-foreground/20" 
                          : "bg-primary/10"
                      )}>
                        <User className={cn(
                          "h-4 w-4",
                          isSelected ? "text-primary-foreground" : "text-primary"
                        )} />
                      </div>
                      <span className="font-semibold text-base truncate">
                        {client.client_identifier}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {hasMultipleSources ? (
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs font-medium px-2 py-1",
                            isSelected 
                              ? "border-primary-foreground/30 text-primary-foreground" 
                              : "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400"
                          )}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Karma
                        </Badge>
                      ) : client.is_client_mode ? (
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs font-medium px-2 py-1",
                            isSelected 
                              ? "border-primary-foreground/30 text-primary-foreground" 
                              : "border-green-300 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400"
                          )}
                        >
                          <User className="w-3 h-3 mr-1" />
                          Danışan Modu
                        </Badge>
                      ) : (
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs font-medium px-2 py-1",
                            isSelected 
                              ? "border-primary-foreground/30 text-primary-foreground/80" 
                              : "border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-950/30 dark:text-gray-400"
                          )}
                        >
                          Anonim Bağlantı
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Alt kısım - İstatistikler */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className={cn(
                        "h-3.5 w-3.5",
                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                      )}>
                        {formatDate(client.last_activity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className={cn(
                        "h-3.5 w-3.5",
                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                      )}>
                        {client.total_exercises} egzersiz
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>
                        En İyi: {client.best_score}
                      </span>
                    </div>
                  </div>

                  {/* Çoklu kaynak detayı */}
                  {hasMultipleSources && (
                    <div className="pt-2 border-t border-border/20">
                      <div className="flex justify-between text-xs">
                        <span className={cn(
                          isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          Danışan Modu: {client.client_mode_sessions}
                        </span>
                        <span className={cn(
                          isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          Anonim: {client.anonymous_sessions}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Screen reader description */}
                  <span 
                    id={`client-desc-${client.client_identifier}`}
                    className="sr-only"
                  >
                    {client.client_identifier}, 
                    {hasMultipleSources 
                      ? `karma veri kaynağı (${client.client_mode_sessions} danışan modu, ${client.anonymous_sessions} anonim)` 
                      : client.is_client_mode ? 'danışan modu' : 'anonim bağlantı'
                    }, 
                    son aktivite {formatDate(client.last_activity)}, 
                    toplam {client.total_exercises} egzersiz, 
                    en yüksek skor {client.best_score}.
                    {isSelected ? ' Şu anda seçili.' : ' Detayları görüntülemek için seçin.'}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientList;
