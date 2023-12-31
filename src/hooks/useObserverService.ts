import { useCallback, useEffect, useState } from 'react';
import { ISubject } from '../services/observer.service';

// custom hook to subscribe component
export function useObserverService(service: ISubject): void {
  const [, forceUpdate] = useState<object>({});
  const refresh = useCallback(() => forceUpdate({}), []);

  useEffect(() => {
    service.subscribe(refresh);

    return () => {
      service.unsubscribe(refresh);
    };
  }, [refresh, service]);
}
