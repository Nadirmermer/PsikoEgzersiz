
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClientInfo {
  client_identifier: string
  last_activity: string
  total_exercises: number
  is_client_mode: boolean
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
          className="loading-skeleton h-16 rounded-lg"
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
          Henüz danışan verisi bulunmuyor
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Danışanlar egzersiz yapmaya başladığında burada görünecekler.
        </p>
      </div>
    </div>
  );

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
          className="space-y-2"
          role="listbox"
          aria-label="Danışan listesi"
          aria-activedescendant={selectedClient ? `client-${selectedClient}` : undefined}
        >
          {clients.map((client) => {
            const isSelected = selectedClient === client.client_identifier;
            
            return (
              <Button
                key={client.client_identifier}
                id={`client-${client.client_identifier}`}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-4 text-left transition-all duration-300 focus-enhanced interactive-lift",
                  isSelected && "bg-primary text-primary-foreground shadow-md scale-[1.02]",
                  !isSelected && "hover:bg-accent/50"
                )}
                onClick={() => onClientSelect(client.client_identifier)}
                role="option"
                aria-selected={isSelected}
                aria-describedby={`client-desc-${client.client_identifier}`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-base truncate pr-2">
                      {client.client_identifier}
                    </span>
                    <Badge 
                      variant={client.is_client_mode ? "default" : "secondary"}
                      className={cn(
                        "text-xs font-medium px-2 py-1",
                        client.is_client_mode 
                          ? "bg-success/20 text-success border-success/30" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {client.is_client_mode ? "Danışan Modu" : "Anonim"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{formatDate(client.last_activity)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{client.total_exercises} egzersiz</span>
                    </span>
                  </div>
                  
                  {/* Screen reader description */}
                  <span 
                    id={`client-desc-${client.client_identifier}`}
                    className="sr-only"
                  >
                    {client.client_identifier}, {client.is_client_mode ? 'danışan modu' : 'anonim kullanıcı'}, 
                    son aktivite {formatDate(client.last_activity)}, 
                    toplam {client.total_exercises} egzersiz tamamlanmış.
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
