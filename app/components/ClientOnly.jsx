/**
 * ClientOnly Component
 * Evita problemas de hidratación renderizando solo en el cliente
 */

'use client';

import { useEffect, useState } from 'react';

export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
