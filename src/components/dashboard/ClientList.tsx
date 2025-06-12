
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar } from 'lucide-react'
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
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danışanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danışanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Henüz danışan verisi bulunmuyor.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Danışanlar ({clients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {clients.map((client) => (
            <Button
              key={client.client_identifier}
              variant={selectedClient === client.client_identifier ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3",
                selectedClient === client.client_identifier && "bg-primary text-primary-foreground"
              )}
              onClick={() => onClientSelect(client.client_identifier)}
            >
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">
                    {client.client_identifier}
                  </span>
                  <Badge 
                    variant={client.is_client_mode ? "default" : "secondary"}
                    className="ml-2 text-xs"
                  >
                    {client.is_client_mode ? "Danışan Modu" : "Anonim"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(client.last_activity).toLocaleDateString('tr-TR')}
                  </span>
                  <span>{client.total_exercises} egzersiz</span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientList
