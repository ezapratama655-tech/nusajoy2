import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient.js';
import { getUserBookings } from '../service/bookingService.js';
import { demoPaymentService } from '../service/demoPaymentService.js';
import { mergeRemoteOrders } from '../utils/demoPayment.js';
import { readTravelData, saveTravelData } from '../utils/travelStorage.js';

export default function useTravelData(createTrip) {
  const emptyData = useCallback(() => ({ trip: createTrip(), orders: [], notifications: [] }), [createTrip]);
  const [state, setState] = useState(() => ({ owner: 'guest', ...readTravelData('guest', emptyData()) }));

  useEffect(() => {
    let active = true;
    let revision = 0;
    const switchOwner = (session) => {
      if (!active) return;
      const owner = session?.user?.id || 'guest';
      setState((current) => current.owner === owner ? current : { owner, ...readTravelData(owner, emptyData()) });
      if (owner !== 'guest') {
        const request = revision;
        queueMicrotask(() => Promise.all([getUserBookings(owner), demoPaymentService.getOrders(owner)]).then(([bookings, demos]) => {
          if (!active || revision !== request) return;
          setState((current) => current.owner !== owner ? current : {
            ...current, orders: mergeRemoteOrders(current.orders, [...demos, ...bookings]),
          });
        }).catch((error) => {
          if (error.code !== 'PGRST205') console.error('Riwayat booking gagal dimuat.', error);
        }));
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      revision += 1;
      switchOwner(session);
    });
    const startRevision = revision;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error && revision === startRevision) switchOwner(data.session);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [emptyData]);

  useEffect(() => {
    try { saveTravelData(state.owner, state); }
    catch (error) { console.error('Perjalanan tidak dapat disimpan di browser.', error); }
  }, [state]);

  const setField = useCallback((field, update, owner) => {
    setState((current) => owner && current.owner !== owner ? current : ({ ...current, [field]: typeof update === 'function' ? update(current[field]) : update }));
  }, []);
  const setActiveTrip = useCallback((update) => setField('trip', update), [setField]);
  const setOrders = useCallback((update, owner) => setField('orders', update, owner), [setField]);
  const setNotifications = useCallback((update, owner) => setField('notifications', update, owner), [setField]);
  return { owner: state.owner, activeTrip: state.trip, orders: state.orders, notifications: state.notifications, setActiveTrip, setOrders, setNotifications };
}
